import { Router } from 'express';
import { pool, ProductRow, CategoryRow, SubcategoryRow } from '../db';

const router = Router();

router.get('/categories', async (_req, res, next) => {
  try {
    const [rows] = await pool.query<CategoryRow[]>(
      'SELECT id, name, slug FROM `categories` WHERE parent_id IS NULL ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/categories:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

router.get('/list', async (_req, res, next) => {
  try {
    const [rows] = await pool.query<ProductRow[]>(
      'SELECT id, categoryId, name, slug, unit, imageUrl, description, keywords FROM `Product` ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/list:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

router.get('/by-slug/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query<ProductRow[]>(
      'SELECT id, categoryId, name, slug, unit, imageUrl, description, keywords FROM `Product` WHERE slug = ? LIMIT 1',
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    const product = rows[0];
    // Optionale Zusatzdaten (falls Tabellen existieren)
    try {
      const [variants] = await pool.query(
        'SELECT id, productId, format, variant, unit, sku, imageUrl FROM ProductVariant WHERE productId = ? ORDER BY id',
        [product.id]
      );
      const [specs] = await pool.query(
        'SELECT id, productId, variantId, format, variant, specKey, specValue FROM ProductSpec WHERE productId = ? ORDER BY id',
        [product.id]
      );
      const [downloads] = await pool.query(
        'SELECT id, productId, title, url FROM ProductDownload WHERE productId = ? ORDER BY id',
        [product.id]
      );
      const [bundles] = await pool.query(
        `SELECT b.relatedProductId AS id, p.name, p.slug
         FROM ProductBundle b
         JOIN Product p ON p.id = b.relatedProductId
         WHERE b.productId = ?
         ORDER BY b.sort, p.name`,
        [product.id]
      );
      return res.json({ ...product, variants, specs, downloads, bundles });
    } catch {
      // Tabellen evtl. noch nicht vorhanden – nur Produkt zurückgeben
      return res.json(product);
    }
  } catch (err) {
    console.error('DB error on GET /api/products/by-slug/:slug:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

router.get('/category/by-slug/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query<CategoryRow[]>(
      'SELECT id, name, slug FROM `categories` WHERE slug = ? LIMIT 1',
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error on GET /api/products/category/by-slug/:slug:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

router.get('/by-category/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query<ProductRow[]>(
      `SELECT p.id, p.categoryId, p.name, p.slug, p.unit, p.imageUrl, p.description, p.keywords
       FROM \`Product\` p
       JOIN \`categories\` c ON c.id = p.categoryId
       WHERE c.slug = ?
       ORDER BY p.name`,
      [req.params.slug]
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/by-category/:slug:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

// Subcategories by category slug
router.get('/subcategories/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query<SubcategoryRow[]>(
      `SELECT child.id, child.parent_id AS categoryId, child.name, child.slug
       FROM categories AS parent
       JOIN categories AS child ON child.parent_id = parent.id
       WHERE parent.slug = ?
       ORDER BY child.name`,
      [req.params.slug]
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/subcategories/:slug:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

export default router;


