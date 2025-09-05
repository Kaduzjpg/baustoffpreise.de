import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Dauer der HTTP-Requests in Sekunden',
  labelNames: ['method', 'route', 'status'] as const
});
register.registerMetric(httpDuration);

export const dbDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Dauer der DB-Abfragen in Sekunden',
  labelNames: ['operation'] as const
});
register.registerMetric(dbDuration);

export const emailEvents = new client.Counter({
  name: 'email_events_total',
  help: 'E-Mail Ereignisse (z. B. dealer/customer, sent/failed)',
  labelNames: ['type', 'status'] as const
});
register.registerMetric(emailEvents);

export async function timeDb<T>(operation: string, promise: Promise<T>): Promise<T> {
  const end = dbDuration.startTimer({ operation });
  try {
    const result = await promise;
    end();
    return result;
  } catch (e) {
    end();
    throw e;
  }
}


