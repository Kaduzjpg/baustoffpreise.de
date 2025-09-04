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

  // Fetch dealers
  const [rows] = await pool.query<DealerRow[]>(
    'SELECT id, name, email, zip, city, street, radiusKm, lat, lng FROM Dealer'
  );

  let count = 0;
  for (const d of rows) {
    const dealerRadius = typeof d.radiusKm === 'number' ? d.radiusKm : radius;
    if (lat != null && lng != null && d.lat != null && d.lng != null) {
      const dist = haversineDistanceKm(lat, lng, d.lat, d.lng);
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
    const [rows] = await pool.query<DealerRow[]>(
      'SELECT id, name, zip, city FROM Dealer ORDER BY name LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB error on GET /api/dealers/list:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

export default router;


