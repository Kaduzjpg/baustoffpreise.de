import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/db', () => {
  // Es wird nicht bis zur DB gekommen, weil Captcha früh abfällt
  return { db: { }, pool: { query: vi.fn() } } as any;
});

import { app } from '../src/app';

describe('POST /api/inquiry/submit (Captcha fail)', () => {
  it('liefert 400 bei fehlgeschlagenem Captcha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ success: false }) }));
    const res = await request(app)
      .post('/api/inquiry/submit')
      .set('x-turnstile-token', 'invalid')
      .send({
        customerEmail: 'test@example.com',
        customerName: 'Max Mustermann',
        customerPhone: '',
        customerZip: '10115',
        customerStreet: 'Musterstr. 1',
        customerCity: 'Berlin',
        radiusKm: 50,
        items: [ { productId: 1, quantity: 1 } ]
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'captcha_failed');
  });
});


