import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { sendMail } from '../mailer';
import { sql } from 'kysely';

const router = Router();

const inquirySchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(2).max(160),
  customerPhone: z.string().optional(),
  customerZip: z.string().regex(/^\d{5}$/),
  customerStreet: z.string().min(3).max(160),
  customerCity: z.string().min(2).max(120),
  radiusKm: z.number().int().min(10).max(200),
  message: z.string().max(2000).optional(),
  attachments: z
    .array(
      z.object({ filename: z.string().max(180), content: z.string(), contentType: z.string().optional() })
    )
    .max(8)
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().positive(),
        note: z.string().max(255).optional()
      })
    )
    .min(1),
  lat: z.number().optional(),
  lng: z.number().optional()
});

router.post('/submit', async (req, res) => {
  const parse = inquirySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid body', details: parse.error.flatten() });
  }
  const data = parse.data;

  // Basic bot protection: optional Turnstile/hCaptcha token verification
  try {
    const token = (req.headers['x-turnstile-token'] as string) || (req.headers['x-hcaptcha-token'] as string);
    if (token) 
    {
      const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET || '', response: token }) as any
      }).then(r => r.json() as any);
      if (!resp?.success) return res.status(400).json({ error: 'captcha_failed' });
    }
  } catch {}

  // Koordinaten ggf. aus PostalCode-Cache ermitteln, wenn nicht gesetzt
  if ((data.lat == null || data.lng == null) && data.customerZip) {
    const pc = await db.selectFrom('PostalCode').select(['lat','lng']).where('zip', '=', data.customerZip).executeTakeFirst();
    if (pc?.lat != null && pc?.lng != null) {
      data.lat = Number(pc.lat);
      data.lng = Number(pc.lng);
    }
  }

  const trx = await db.transaction().begin();
  try {
    const inserted = await trx
      .insertInto('Inquiry')
      .values({
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone ?? null,
        customerZip: data.customerZip,
        customerStreet: data.customerStreet,
        customerCity: data.customerCity,
        radiusKm: data.radiusKm,
        message: data.message ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        createdAt: new Date()
      })
      .executeTakeFirst();

    const inquiryId = Number(inserted.insertId);

    if (data.items.length) {
      await trx
        .insertInto('InquiryItem')
        .values(
          data.items.map((it) => ({
            inquiryId,
            productId: it.productId,
            quantity: it.quantity,
            note: it.note ?? null
          }))
        )
        .execute();
    }

    // Dealer matching per SQL (Koordinaten oder ZIP-Präfix)
    let dealers: { id: number; name: string; email: string | null }[] = [];
    if (data.lat != null && data.lng != null) {
      dealers = await trx
        .selectFrom('Dealer')
        .select(['id','name','email'])
        .where('location', 'is not', null)
        .where(sql`ST_Distance_Sphere(location, ST_SRID(POINT(${data.lng}, ${data.lat}), 4326)) <= (LEAST(COALESCE(radiusKm, ${data.radiusKm}), ${data.radiusKm}) * 1000)`) // min(radiusKm, radius)
        .execute();
    } else {
      const zip2 = data.customerZip.slice(0, 2);
      dealers = await trx
        .selectFrom('Dealer')
        .select(['id','name','email','zip'])
        .where(sql`LEFT(zip, 2) = ${zip2}`)
        .execute();
    }

    const itemsHtml = data.items
      .map(
        (i) =>
          `<li>Produkt #${i.productId}: Menge ${i.quantity}${i.note ? ` — Hinweis: ${i.note}` : ''}</li>`
      )
      .join('');

    const dealerSubject = `Neue Anfrage aus ${data.customerZip} (${data.items.length} Positionen)`;
    const dealerHtml = (dealerName: string) => `
      <h2>Neue Anfrage</h2>
      <p>Hallo ${dealerName},</p>
      <p>es gibt eine neue Anfrage aus PLZ ${data.customerZip}.</p>
      <p><strong>Kunde:</strong> ${data.customerName} — ${data.customerEmail}${
        data.customerPhone ? ' — ' + data.customerPhone : ''
      }</p>
      <p><strong>Adresse:</strong> ${data.customerStreet}, ${data.customerZip} ${data.customerCity}</p>
      <p><strong>Radius:</strong> ${data.radiusKm} km</p>
      ${data.message ? `<p><strong>Nachricht:</strong> ${data.message}</p>` : ''}
      <p><strong>Positionen:</strong></p>
      <ul>${itemsHtml}</ul>
    `;

    const attachments = (data.attachments || []).map((a) => ({ filename: a.filename, content: Buffer.from(a.content, 'base64'), contentType: a.contentType }));

    await Promise.all(
      dealers.map(async (d) => {
        try {
          await sendMail({ to: d.email || '', subject: dealerSubject, html: dealerHtml(d.name), replyTo: data.customerEmail, attachments });
          await trx
            .insertInto('InquiryDealerNotification')
            .values({ inquiryId, dealerId: d.id, email: d.email ?? null, status: 'sent', error: null, createdAt: new Date() })
            .execute();
        } catch (e: any) {
          try {
            await trx
              .insertInto('InquiryDealerNotification')
              .values({ inquiryId, dealerId: d.id, email: d.email ?? null, status: 'failed', error: String(e?.message || 'send_failed'), createdAt: new Date() })
              .execute();
          } catch {}
        }
      })
    );

    await trx.commit();
    res.json({ dealersNotified: dealers.length, inquiryId });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

export default router;


