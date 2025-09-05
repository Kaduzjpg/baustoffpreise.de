import { Router } from 'express';
import { pool, db } from '../db';

const router = Router();

router.get('/categories', async (_req, res) => {
  try {
    const rows = await db
      .selectFrom('categories')
      .select(['id', 'name', 'slug'])
      .where('parent_id', 'is', null)
      .orderBy('name asc')
      .execute();
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/categories:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

// Legacy full list (kept for compatibility)
router.get('/list', async (_req, res) => {
  try {
    const rows = await db
      .selectFrom('Product')
      .select(['id', 'categoryId', 'name', 'slug', 'unit', 'imageUrl', 'description', 'keywords'])
      .orderBy('name asc')
      .execute();
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

router.get('/by-slug/:slug', async (req, res) => {
  try {
    const product = await db
      .selectFrom('Product')
      .select(['id','categoryId','name','slug','unit','imageUrl','description','keywords'])
      .where('slug', '=', req.params.slug)
      .executeTakeFirst();
    if (!product) return res.status(404).json({ error: 'Not found' });
    // Optionale Zusatzdaten (falls Tabellen existieren)
    try {
      const variants = await db
        .selectFrom('ProductVariant')
        .select(['id','productId','format','variant','unit','sku','imageUrl'])
        .where('productId', '=', product.id)
        .orderBy('id asc')
        .execute();
      const specs = await db
        .selectFrom('ProductSpec')
        .select(['id','productId','variantId','format','variant','specKey','specValue'])
        .where('productId', '=', product.id)
        .orderBy('id asc')
        .execute();
      const downloads = await db
        .selectFrom('ProductDownload')
        .select(['id','productId','title','url'])
        .where('productId', '=', product.id)
        .orderBy('id asc')
        .execute();
      const bundles = await db
        .selectFrom('ProductBundle as b')
        .innerJoin('Product as p', 'p.id', 'b.relatedProductId')
        .select(['b.relatedProductId as id', 'p.name as name', 'p.slug as slug'])
        .where('b.productId', '=', product.id)
        .orderBy('b.sort asc')
        .orderBy('p.name asc')
        .execute();
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

router.get('/category/by-slug/:slug', async (req, res) => {
  try {
    const row = await db
      .selectFrom('categories')
      .select(['id','name','slug'])
      .where('slug', '=', req.params.slug)
      .executeTakeFirst();
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('DB error on GET /api/products/category/by-slug/:slug:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

router.get('/by-category/:slug', async (req, res) => {
  try {
    const rows = await db
      .selectFrom('Product as p')
      .innerJoin('categories as c', 'c.id', 'p.categoryId')
      .select(['p.id','p.categoryId','p.name','p.slug','p.unit','p.imageUrl','p.description','p.keywords'])
      .where('c.slug', '=', req.params.slug)
      .orderBy('p.name asc')
      .execute();
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/by-category/:slug:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

// Subcategories by category slug
router.get('/subcategories/:slug', async (req, res) => {
  try {
    const rows = await db
      .selectFrom('categories as parent')
      .innerJoin('categories as child', 'child.parent_id', 'parent.id')
      .select(['child.id','child.parent_id as categoryId','child.name','child.slug'])
      .where('parent.slug', '=', req.params.slug)
      .orderBy('child.name asc')
      .execute();
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/products/subcategories/:slug:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

export default router;


