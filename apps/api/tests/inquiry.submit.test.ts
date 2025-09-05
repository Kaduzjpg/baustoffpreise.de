import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import * as mailer from '../src/mailer';

vi.mock('../src/mailer', () => ({ sendMail: vi.fn().mockResolvedValue(undefined) }));

// Modul-Mocks vor Import der App setzen
vi.mock('../src/db', () => {
  const insertInto = vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ executeTakeFirst: vi.fn().mockResolvedValue({ insertId: 1 }), execute: vi.fn().mockResolvedValue(undefined) }) });
  const chainWhere = { execute: vi.fn().mockResolvedValue([]), executeTakeFirst: vi.fn().mockResolvedValue(undefined) } as any;
  const chainSelect = { where: vi.fn().mockReturnValue(chainWhere) } as any;
  const chainStart = { select: vi.fn().mockReturnValue(chainSelect) } as any;
  const trx = {
    insertInto,
    selectFrom: vi.fn().mockReturnValue(chainStart),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined)
  } as any;
  const topSelectFrom = vi.fn().mockReturnValue(chainStart);
  return {
    db: { transaction: () => ({ begin: vi.fn().mockResolvedValue(trx) }), selectFrom: topSelectFrom },
    pool: { query: vi.fn() }
  } as any;
});

import { app } from '../src/app';

describe('POST /api/inquiry/submit', () => {
  it('nimmt Anfrage an und sendet Mails (gemockt)', async () => {
    // Globale fetch-API stubben, um kein externes Geocoding aufzurufen
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ results: [] }) }));
    const payload = {
      customerEmail: 'test@example.com',
      customerName: 'Max Mustermann',
      customerPhone: '',
      customerZip: '10115',
      customerStreet: 'Musterstr. 1',
      customerCity: 'Berlin',
      radiusKm: 50,
      message: 'Bitte Angebot',
      items: [ { productId: 1, quantity: 2 } ]
    } as any;

    const res = await request(app).post('/api/inquiry/submit').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('inquiryId');
  });
});
