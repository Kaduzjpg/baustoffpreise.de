import { Router } from 'express';
import { z } from 'zod';
import { pool, DealerRow } from '../db';
import { haversineDistanceKm } from '../utils/distance';

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

  // If no coords, try to resolve zip -> lat/lng via free endpoint (Open-Meteo geocoding as example)
  let qLat = lat;
  let qLng = lng;
  try {
    if ((qLat == null || qLng == null) && zip) {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=de&format=json`).then(r => r.json() as any);
      const loc = geo?.results?.[0];
      if (loc) { qLat = Number(loc.latitude); qLng = Number(loc.longitude); }
    }
  } catch {}

  // Fetch dealers with coarse pre-filtering
  let rows: any[] = [];
  if (qLat != null && qLng != null) {
    // MySQL: ST_Distance_Sphere mit POINT(lng,lat) und SRID 4326
    const [rs] = await pool.query<any[]>(
      `SELECT id, name, email, zip, city, street, radiusKm, lat, lng
       FROM Dealer
       WHERE location IS NOT NULL
       AND ST_Distance_Sphere(location, ST_SRID(POINT(?, ?), 4326)) <= (? * 1000)`,
      [qLng, qLat, radius]
    );
    rows = rs;
  } else {
    // Fallback: same ZIP prefix (first 2 digits)
    const zip2 = zip.slice(0, 2);
    const [rs] = await pool.query<any[]>(
      'SELECT id, name, email, zip, city, street, radiusKm, lat, lng FROM Dealer WHERE LEFT(zip, 2) = ?', [zip2]
    );
    rows = rs;
  }

  let count = 0;
  for (const d of rows) {
    const dealerRadius = typeof d.radiusKm === 'number' ? d.radiusKm : radius;
    if (qLat != null && qLng != null && d.lat != null && d.lng != null) {
      const dist = haversineDistanceKm(qLat, qLng, d.lat, d.lng);
      if (dist <= Math.min(radius, dealerRadius)) count++;
    } else {
      if (d.zip?.slice(0, 2) === zip.slice(0, 2)) count++;
    }
  }

  res.json({ dealersFound: count });
});

// List of dealers for UI sections (carousel)
router.get('/list', async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, name, zip, city FROM Dealer ORDER BY name LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/dealers/list:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

export default router;


