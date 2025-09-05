import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/db', () => {
  // ZIP-Fallback: kein PostalCode-Eintrag -> kein fetch, denn wir testen rein den ZIP-Präfix-Count-Pfad
  const selectPostal = { select: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ executeTakeFirst: vi.fn().mockResolvedValue(undefined) }) }) } as any;
  const countRes = [{ cnt: 3 }];
  const selectDealerCount = { select: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ executeTakeFirst: vi.fn().mockResolvedValue(countRes[0]) }) }) } as any;
  return {
    db: {
      selectFrom: vi.fn()
        .mockReturnValueOnce(selectPostal) // PostalCode lookup
        .mockReturnValueOnce(selectDealerCount) // Dealer count via ZIP prefix
    },
    pool: { query: vi.fn() }
  } as any;
});

import { app } from '../src/app';

describe('GET /api/dealers/lookup (ZIP-Fallback)', () => {
  it('zählt Händler per ZIP-Präfix', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ results: [] }) }));
    const res = await request(app).get('/api/dealers/lookup').query({ zip: '10115', radius: 50 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ dealersFound: 3 });
  });
});


