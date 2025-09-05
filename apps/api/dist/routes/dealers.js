"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const distance_1 = require("../utils/distance");
const router = (0, express_1.Router)();
const lookupQuerySchema = zod_1.z.object({
    zip: zod_1.z.string().regex(/^\d{5}$/),
    radius: zod_1.z.coerce.number().int().min(10).max(200).default(50),
    lat: zod_1.z.coerce.number().optional(),
    lng: zod_1.z.coerce.number().optional()
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
            const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=de&format=json`).then(r => r.json());
            const loc = geo?.results?.[0];
            if (loc) {
                qLat = Number(loc.latitude);
                qLng = Number(loc.longitude);
            }
        }
    }
    catch { }
    // Fetch dealers
    const [rows] = await db_1.pool.query('SELECT id, name, email, zip, city, street, radiusKm, lat, lng FROM Dealer');
    let count = 0;
    for (const d of rows) {
        const dealerRadius = typeof d.radiusKm === 'number' ? d.radiusKm : radius;
        if (qLat != null && qLng != null && d.lat != null && d.lng != null) {
            const dist = (0, distance_1.haversineDistanceKm)(qLat, qLng, d.lat, d.lng);
            if (dist <= Math.min(radius, dealerRadius))
                count++;
        }
        else {
            if (d.zip?.slice(0, 2) === zip.slice(0, 2))
                count++;
        }
    }
    res.json({ dealersFound: count });
});
// List of dealers for UI sections (carousel)
router.get('/list', async (_req, res) => {
    try {
        const [rows] = await db_1.pool.query('SELECT id, name, zip, city FROM Dealer ORDER BY name LIMIT 50');
        res.json(rows);
    }
    catch (err) {
        console.error('DB error on GET /api/dealers/list:', err);
        return res.status(503).json({ error: 'db_unavailable' });
    }
});
exports.default = router;
