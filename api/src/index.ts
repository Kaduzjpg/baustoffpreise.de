import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { env } from './env';
import { pingDatabase, dbPool } from './db';
import { lookupQuerySchema, inquirySchema } from './schemas';
import { matchDealersByZipRadius } from './match';
import { sendMail } from './mailer';
import { dealerNotificationTemplate, customerConfirmationTemplate } from './emailTemplates';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const rateLimiter = new RateLimiterMemory({ points: 60, duration: 60 });
app.use(async (req, res, next) => {
  try {
    const key = (req.ip as string | undefined) ?? '0.0.0.0';
    await rateLimiter.consume(key);
    next();
  } catch (e) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

app.get('/healthz', async (req, res) => {
  try {
    await pingDatabase();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

app.get('/api/dealers/lookup', async (req, res) => {
  const parse = lookupQuerySchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { zip, radius } = parse.data;
  try {
    const dealers = await matchDealersByZipRadius(zip, radius);
    res.json({ estimatedDealers: dealers.length });
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed' });
  }
});

app.post('/api/inquiry/submit', async (req, res) => {
  const parse = inquirySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const payload = parse.data;
  const conn = await dbPool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query<{ insertId: number } & any>(
      'INSERT INTO Inquiry (customer_name, customer_email, customer_phone, zip, radius_km, note, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [
        payload.customerName,
        payload.customerEmail,
        payload.customerPhone || null,
        payload.zip,
        payload.radius,
        payload.note || null,
      ]
    );
    const inquiryId = (result as any).insertId as number;

    const values: any[] = [];
    for (const item of payload.items) {
      values.push([inquiryId, item.productId, item.quantity, item.note || null]);
    }
    if (values.length) {
      await conn.query(
        'INSERT INTO InquiryItem (inquiry_id, product_id, quantity, note) VALUES ?',[values]
      );
    }

    await conn.commit();

    const dealers = await matchDealersByZipRadius(payload.zip, payload.radius);
    const notified: number[] = [];
    await Promise.all(
      dealers.map(async (d) => {
        try {
          const tpl = dealerNotificationTemplate({ inquiryId, inquiry: payload, dealerName: d.name });
          await sendMail({ to: d.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
          notified.push(d.id);
        } catch {}
      })
    );

    try {
      const tpl = customerConfirmationTemplate({ inquiryId, inquiry: payload });
      await sendMail({ to: payload.customerEmail, subject: tpl.subject, html: tpl.html, text: tpl.text });
    } catch {}

    res.json({ ok: true, inquiryId, dealersNotified: notified.length });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    res.status(500).json({ error: 'Submit failed' });
  } finally {
    conn.release();
  }
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${env.PORT}`);
});


