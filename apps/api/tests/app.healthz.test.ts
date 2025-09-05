import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { pool } from '../src/db';

describe('GET /healthz', () => {
  const spy = vi.spyOn(pool, 'query').mockResolvedValue([[{ '1': 1 }]] as any);
  afterAll(() => { spy.mockRestore(); });

  it('liefert ok:true bei erfolgreicher DB-Abfrage', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});


