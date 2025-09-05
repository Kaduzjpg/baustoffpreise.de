import 'dotenv/config';
// Optional Sentry init for API
if (process.env.SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/node');
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  } catch {}
}
import { env } from './env';
import { app } from './app';
import * as Sentry from '@sentry/node';

app.listen(Number(env.PORT), () => {
  console.log(`API listening on :${env.PORT}`);
});


