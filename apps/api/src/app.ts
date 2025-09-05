import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { nanoid } from 'nanoid';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { env } from './env';
import { pool } from './db';
import { json } from 'express';
import dealersRouter from './routes/dealers';
import inquiryRouter from './routes/inquiry';
import productsRouter from './routes/products';
import { register, httpDuration } from './metrics';
import * as Sentry from '@sentry/node';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false
  })
);
// Request ID + structured logging
app.use((req, res, next) => {
  (req as any).id = (req.headers['x-request-id'] as string) || nanoid(10);
  res.setHeader('x-request-id', (req as any).id);
  next();
});

// JSON logs without personenbezogene Daten (keine Bodies)
morgan.token('id', (req) => String((req as any).id || ''));
app.use(
  morgan((tokens, req, res) => {
    const log = {
      ts: new Date().toISOString(),
      level: 'info',
      requestId: tokens.id(req, res),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res) || 0),
      length: tokens.res(req, res, 'content-length') || '0',
      responseTimeMs: Number(tokens['response-time'](req, res) || 0),
      ip: (req as any).headers['x-forwarded-for'] || (req as any).socket.remoteAddress
    } as const;
    return JSON.stringify(log);
  })
);
app.use(json({ limit: '1mb' }));

app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    end({ status: String(res.statusCode) });
  });
  next();
});

const rateLimiter = new RateLimiterMemory({ points: 60, duration: 60 });
const inquiryLimiter = new RateLimiterMemory({ points: 5, duration: 60 });
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
});

app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'db' });
  }
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/dealers', dealersRouter);
app.use('/api/inquiry', async (req, res, next) => {
  try {
    await inquiryLimiter.consume(req.ip || 'unknown');
    next();
  } catch {
    res.status(429).json({ error: 'Too many inquiries' });
  }
}, inquiryRouter);
app.use('/api/products', productsRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Central error handler
  try {
    try { Sentry.captureException(err); } catch {}
    const rid = (_req as any)?.id;
    console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'error', requestId: rid, msg: err?.message || 'Unhandled error' }));
  } catch {
    console.error(err);
  }
  res.status(err?.status || 500).json({ error: 'Internal Server Error' });
});

export { app };


