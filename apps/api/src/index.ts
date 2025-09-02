import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { env } from './env';
import { pool } from './db';
import { json } from 'express';
import dealersRouter from './routes/dealers';
import inquiryRouter from './routes/inquiry';
import productsRouter from './routes/products';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false
  })
);
app.use(morgan('dev'));
app.use(json({ limit: '1mb' }));

const rateLimiter = new RateLimiterMemory({ points: 60, duration: 60 });
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

app.use('/api/dealers', dealersRouter);
app.use('/api/inquiry', inquiryRouter);
app.use('/api/products', productsRouter);

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Central error handler
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ error: status >= 500 ? 'Internal Server Error' : err?.message || 'Error' });
});

app.listen(Number(env.PORT), () => {
  console.log(`API listening on :${env.PORT}`);
});


