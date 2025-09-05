import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/db', () => {
  const execute = vi.fn().mockResolvedValue([
    { id: 1, name: 'Baustoffe', slug: 'baustoffe' },
    { id: 2, name: 'Werkzeuge', slug: 'werkzeuge' }
  ]);
  const chain = { where: vi.fn().mockReturnValue({ orderBy: vi.fn().mockReturnValue({ execute }) }) } as any;
  return {
    db: { selectFrom: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(chain) }) },
    pool: { query: vi.fn() }
  } as any;
});

import { app } from '../src/app';

describe('GET /api/products/categories', () => {
  it('liefert Kategorien aus der DB', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name');
  });
});


