import { Router } from 'express';
import { z } from 'zod';
import { pool, DealerRow } from '../db';
import { sendMail } from '../mailer';
import { haversineDistanceKm } from '../utils/distance';

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

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [inquiryResult] = await conn.query<any>(
      'INSERT INTO Inquiry (customerEmail, customerName, customerPhone, customerZip, customerStreet, customerCity, radiusKm, message, lat, lng, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        data.customerEmail,
        data.customerName,
        data.customerPhone ?? null,
        data.customerZip,
        data.customerStreet,
        data.customerCity,
        data.radiusKm,
        data.message ?? null,
        data.lat ?? null,
        data.lng ?? null
      ]
    );
    const inquiryId = inquiryResult.insertId as number;

    const itemsValues = data.items.map((it) => [inquiryId, it.productId, it.quantity, it.note ?? null]);
    await conn.query(
      'INSERT INTO InquiryItem (inquiryId, productId, quantity, note) VALUES ?',[itemsValues]
    );

    // Dealer matching
    const [dealers] = await conn.query<DealerRow[]>(
      'SELECT id, name, email, zip, city, street, radiusKm, lat, lng FROM Dealer'
    );

    const matched: DealerRow[] = [];
    for (const d of dealers) {
      const dealerRadius = typeof d.radiusKm === 'number' ? d.radiusKm : data.radiusKm;
      if (data.lat != null && data.lng != null && d.lat != null && d.lng != null) {
        const dist = haversineDistanceKm(data.lat, data.lng, d.lat, d.lng);
        if (dist <= Math.min(data.radiusKm, dealerRadius)) matched.push(d);
      } else {
        if (d.zip?.slice(0, 2) === data.customerZip.slice(0, 2)) matched.push(d);
      }
    }

    // Send emails to dealers
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
      matched.map((d) =>
        sendMail({ to: d.email, subject: dealerSubject, html: dealerHtml(d.name), replyTo: data.customerEmail, attachments })
      )
    );

    // Confirmation to customer
    const customerHtml = `
      <h2>Ihre Anfrage wurde versendet</h2>
      <p>Hallo ${data.customerName},</p>
      <p>wir haben Ihre Anfrage an ${matched.length} Händler in Ihrer Region weitergeleitet. Diese melden sich per E-Mail bei Ihnen.</p>
    `;
    await sendMail({ to: data.customerEmail, subject: 'Ihre Anfrage ist eingegangen', html: customerHtml });

    await conn.commit();
    res.json({ dealersNotified: matched.length, inquiryId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  } finally {
    conn.release();
  }
});

export default router;


