import { Router } from 'express';
import { pool, db } from '../db';

const router = Router();

router.get('/categories', async (_req, res, next) => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, name, slug FROM `categories` WHERE parent_id IS NULL ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/categories:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

// Legacy full list (kept for compatibility)
router.get('/list', async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, categoryId, name, slug, unit, imageUrl, description, keywords FROM `Product` ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/list:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

// Server-side search with pagination & filters
router.get('/search', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSize = Math.min(60, Math.max(1, parseInt(String(req.query.pageSize || '12'), 10) || 12));
    const unit = String(req.query.unit || '').trim();
    const categoryId = parseInt(String(req.query.categoryId || ''), 10);
    const brand = String(req.query.brand || '').trim();
    const stock = String(req.query.stock || '').trim();
    const q = String(req.query.q || '').trim();
    const sort = String(req.query.sort || '').trim().toLowerCase();
    const zip = String(req.query.zip || '').trim();
    const radiusKm = parseInt(String(req.query.radius || ''), 10);

    // Query mit Kysely aufbauen
    let base = db.selectFrom('Product').select([
      'id', 'categoryId', 'name', 'slug', 'unit', 'imageUrl', 'description'
    ]);
    if (q) {
      const like = `%${q}%`;
      base = base.where(eb => eb.or([
        eb('name', 'like', like),
        eb('slug', 'like', like),
        eb('keywords', 'like', like),
        eb('description', 'like', like)
      ]));
    }
    if (unit) base = base.where('unit', '=', unit);
    if (!isNaN(categoryId)) base = base.where('categoryId', '=', categoryId);
    if (brand) base = base.where('brand', '=', brand);
    if (stock) base = base.where('stockType', '=', stock);

    let ordered = base.orderBy('name asc');
    if (sort === 'name_desc') ordered = base.orderBy('name desc');
    if (sort === 'name_asc') ordered = base.orderBy('name asc');

    // Optional: Dealer-Lookup nach PLZ/Radius. Wenn keine Händler erreichbar, liefern wir 0 Ergebnisse zurück
    let dealersFound: number | undefined = undefined;
    if (/^\d{5}$/.test(zip) && !isNaN(radiusKm)) {
      const [rows]: any = await pool.query(
        'SELECT zip, city, radiusKm, lat, lng FROM Dealer'
      );
      let count = 0;
      for (const d of rows || []) {
        const dealerRadius = typeof d.radiusKm === 'number' ? d.radiusKm : radiusKm;
        // Sehr einfache Heuristik: gleiche Vorwahl-PLZ (erste 2 Ziffern)
        if ((d.zip || '').slice(0, 2) === zip.slice(0, 2)) count++;
      }
      dealersFound = count;
      if (count === 0) {
        return res.json({ items: [], total: 0, page, pageSize, dealersFound: 0 });
      }
    }

    const totalRow = await db.selectFrom('Product')
      .select(({ fn }) => fn.countAll<number>().as('cnt'))
      .if(q, qb => qb.where(eb => eb.or([
        eb('name', 'like', `%${q}%`),
        eb('slug', 'like', `%${q}%`),
        eb('keywords', 'like', `%${q}%`),
        eb('description', 'like', `%${q}%`)
      ])))
      .if(unit, qb => qb.where('unit', '=', unit))
      .if(!isNaN(categoryId), qb => qb.where('categoryId', '=', categoryId))
      .if(brand, qb => qb.where('brand', '=', brand))
      .if(stock, qb => qb.where('stockType', '=', stock))
      .executeTakeFirstOrThrow();

    const offset = (page - 1) * pageSize;
    const items = await ordered.limit(pageSize).offset(offset).execute();
    res.json({ items, total: Number((totalRow as any).cnt || 0), page, pageSize, dealersFound });
  } catch (err) {
    console.error('DB error on GET /api/products/search:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

router.get('/by-slug/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query<any[]>(
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
    const [rows] = await pool.query<any[]>(
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
    const [rows] = await pool.query<any[]>(
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
    const [rows] = await pool.query<any[]>(
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


