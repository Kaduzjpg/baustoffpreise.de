import { Router } from 'express';
import { pool, ProductRow, CategoryRow } from '../db';

const router = Router();

router.get('/categories', async (_req, res) => {
  const [rows] = await pool.query<CategoryRow[]>(
    'SELECT id, name, slug, description FROM Category ORDER BY name'
  );
  res.json(rows);
});

router.get('/list', async (_req, res) => {
  const [rows] = await pool.query<ProductRow[]>(
    'SELECT id, categoryId, name, slug, unit, imageUrl, description, keywords FROM Product ORDER BY name'
  );
  res.json(rows);
});

router.get('/by-slug/:slug', async (req, res) => {
  const [rows] = await pool.query<ProductRow[]>(
    'SELECT id, categoryId, name, slug, unit, imageUrl, description, keywords FROM Product WHERE slug = ? LIMIT 1',
    [req.params.slug]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.get('/category/by-slug/:slug', async (req, res) => {
  const [rows] = await pool.query<CategoryRow[]>(
    'SELECT id, name, slug, description FROM Category WHERE slug = ? LIMIT 1',
    [req.params.slug]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.get('/by-category/:slug', async (req, res) => {
  const [rows] = await pool.query<ProductRow[]>(
    `SELECT p.id, p.categoryId, p.name, p.slug, p.unit, p.imageUrl, p.description, p.keywords
     FROM Product p
     JOIN Category c ON c.id = p.categoryId
     WHERE c.slug = ?
     ORDER BY p.name`,
    [req.params.slug]
  );
  res.json(rows);
});

export default router;


