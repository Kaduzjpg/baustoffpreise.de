import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/db', () => {
  const execute = vi.fn().mockResolvedValue([
    { id: 1, name: 'Händler A', zip: '10115', city: 'Berlin' },
    { id: 2, name: 'Händler B', zip: '20095', city: 'Hamburg' }
  ]);
  const chain = { select: vi.fn().mockReturnValue({ orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ execute }) }) }) } as any;
  return {
    db: { selectFrom: vi.fn().mockReturnValue(chain) },
    pool: { query: vi.fn() }
  } as any;
});

import { app } from '../src/app';

describe('GET /api/dealers/list', () => {
  it('liefert eine Liste von Händlern', async () => {
    const res = await request(app).get('/api/dealers/list');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});


