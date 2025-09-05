import { Router } from 'express';
import { z } from 'zod';
import { pool, db } from '../db';
import { sql } from 'kysely';

const router = Router();

const lookupQuerySchema = z.object({
  zip: z.string().regex(/^\d{5}$/),
  radius: z.coerce.number().int().min(10).max(200).default(50),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional()
});

router.get('/lookup', async (req, res) => {
  const parse = lookupQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid query', details: parse.error.flatten() });
  }
  const { zip, radius, lat, lng } = parse.data;

  // Koordinaten ggf. aus PostalCode-Cache ermitteln
  let qLat = lat;
  let qLng = lng;
  if ((qLat == null || qLng == null) && zip) {
    const pc = await db.selectFrom('PostalCode').select(['lat','lng']).where('zip', '=', zip).executeTakeFirst();
    if (pc?.lat != null && pc?.lng != null) {
      qLat = Number(pc.lat);
      qLng = Number(pc.lng);
    } else {
      try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=de&format=json`).then(r => r.json() as any);
        const loc = geo?.results?.[0];
        if (loc) {
          qLat = Number(loc.latitude);
          qLng = Number(loc.longitude);
          await db
            .insertInto('PostalCode')
            .values({ zip, city: String(loc.name || ''), lat: qLat, lng: qLng, updatedAt: new Date() })
            .onDuplicateKeyUpdate({
              city: (eb) => eb.ref('excluded.city'),
              lat: (eb) => eb.ref('excluded.lat'),
              lng: (eb) => eb.ref('excluded.lng'),
              updatedAt: (eb) => eb.ref('excluded.updatedAt')
            })
            .execute();
        }
      } catch {}
    }
  }

  // SQL-Count statt JS-Haversine
  if (qLat != null && qLng != null) {
    const row = await db
      .selectFrom('Dealer')
      .select(({ fn }) => fn.countAll<number>().as('cnt'))
      .where('location', 'is not', null)
      .where(sql`ST_Distance_Sphere(location, ST_SRID(POINT(${qLng}, ${qLat}), 4326)) <= (LEAST(COALESCE(radiusKm, ${radius}), ${radius}) * 1000)`) // min(radiusKm, radius)
      .executeTakeFirst();
    return res.json({ dealersFound: Number(row?.cnt || 0) });
  } else {
    const zip2 = zip.slice(0, 2);
    const row = await db
      .selectFrom('Dealer')
      .select(({ fn }) => fn.countAll<number>().as('cnt'))
      .where(sql`LEFT(zip, 2) = ${zip2}`)
      .executeTakeFirst();
    return res.json({ dealersFound: Number(row?.cnt || 0) });
  }
});

// List of dealers for UI sections (carousel)
router.get('/list', async (_req, res) => {
  try {
    const rows = await db
      .selectFrom('Dealer')
      .select(['id', 'name', 'zip', 'city'])
      .orderBy('name asc')
      .limit(50)
      .execute();
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/dealers/list:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

export default router;


