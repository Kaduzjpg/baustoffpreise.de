"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const mailer_1 = require("../mailer");
const distance_1 = require("../utils/distance");
const router = (0, express_1.Router)();
const inquirySchema = zod_1.z.object({
    customerEmail: zod_1.z.string().email(),
    customerName: zod_1.z.string().min(2).max(160),
    customerPhone: zod_1.z.string().optional(),
    customerZip: zod_1.z.string().regex(/^\d{5}$/),
    customerStreet: zod_1.z.string().min(3).max(160),
    customerCity: zod_1.z.string().min(2).max(120),
    radiusKm: zod_1.z.number().int().min(10).max(200),
    message: zod_1.z.string().max(2000).optional(),
    attachments: zod_1.z
        .array(zod_1.z.object({ filename: zod_1.z.string().max(180), content: zod_1.z.string(), contentType: zod_1.z.string().optional() }))
        .max(8)
        .optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.number().int().positive(),
        quantity: zod_1.z.number().positive(),
        note: zod_1.z.string().max(255).optional()
    }))
        .min(1),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional()
});
router.post('/submit', async (req, res) => {
    const parse = inquirySchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid body', details: parse.error.flatten() });
    }
    const data = parse.data;
    // Basic bot protection: optional Turnstile/hCaptcha token verification
    try {
        const token = req.headers['x-turnstile-token'] || req.headers['x-hcaptcha-token'];
        if (token) {
            const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET || '', response: token })
            }).then(r => r.json());
            if (!resp?.success)
                return res.status(400).json({ error: 'captcha_failed' });
        }
    }
    catch { }
    const conn = await db_1.pool.getConnection();
    try {
        await conn.beginTransaction();
        const [inquiryResult] = await conn.query('INSERT INTO Inquiry (customerEmail, customerName, customerPhone, customerZip, customerStreet, customerCity, radiusKm, message, lat, lng, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', [
            data.customerEmail,
            data.customerName,
            data.customerPhone ?? null,
            data.customerZip,
            data.customerStreet,
            data.customerCity,
            data.radiusKm,
            data.message ?? null,
            data.lat ?? null,
            data.lng ?? null
        ]);
        const inquiryId = inquiryResult.insertId;
        const itemsValues = data.items.map((it) => [inquiryId, it.productId, it.quantity, it.note ?? null]);
        await conn.query('INSERT INTO InquiryItem (inquiryId, productId, quantity, note) VALUES ?', [itemsValues]);
        // Dealer matching
        const [dealers] = await conn.query('SELECT id, name, email, zip, city, street, radiusKm, lat, lng FROM Dealer');
        const matched = [];
        for (const d of dealers) {
            const dealerRadius = typeof d.radiusKm === 'number' ? d.radiusKm : data.radiusKm;
            if (data.lat != null && data.lng != null && d.lat != null && d.lng != null) {
                const dist = (0, distance_1.haversineDistanceKm)(data.lat, data.lng, d.lat, d.lng);
                if (dist <= Math.min(data.radiusKm, dealerRadius))
                    matched.push(d);
            }
            else {
                if (d.zip?.slice(0, 2) === data.customerZip.slice(0, 2))
                    matched.push(d);
            }
        }
        // Send emails to dealers
        const itemsHtml = data.items
            .map((i) => `<li>Produkt #${i.productId}: Menge ${i.quantity}${i.note ? ` — Hinweis: ${i.note}` : ''}</li>`)
            .join('');
        const dealerSubject = `Neue Anfrage aus ${data.customerZip} (${data.items.length} Positionen)`;
        const dealerHtml = (dealerName) => `
      <h2>Neue Anfrage</h2>
      <p>Hallo ${dealerName},</p>
      <p>es gibt eine neue Anfrage aus PLZ ${data.customerZip}.</p>
      <p><strong>Kunde:</strong> ${data.customerName} — ${data.customerEmail}${data.customerPhone ? ' — ' + data.customerPhone : ''}</p>
      <p><strong>Adresse:</strong> ${data.customerStreet}, ${data.customerZip} ${data.customerCity}</p>
      <p><strong>Radius:</strong> ${data.radiusKm} km</p>
      ${data.message ? `<p><strong>Nachricht:</strong> ${data.message}</p>` : ''}
      <p><strong>Positionen:</strong></p>
      <ul>${itemsHtml}</ul>
    `;
        const attachments = (data.attachments || []).map((a) => ({ filename: a.filename, content: Buffer.from(a.content, 'base64'), contentType: a.contentType }));
        await Promise.all(matched.map((d) => (0, mailer_1.sendMail)({ to: d.email, subject: dealerSubject, html: dealerHtml(d.name), replyTo: data.customerEmail, attachments })));
        // Confirmation to customer
        const customerHtml = `
      <h2>Ihre Anfrage wurde versendet</h2>
      <p>Hallo ${data.customerName},</p>
      <p>wir haben Ihre Anfrage an ${matched.length} Händler in Ihrer Region weitergeleitet. Diese melden sich per E-Mail bei Ihnen.</p>
    `;
        await (0, mailer_1.sendMail)({ to: data.customerEmail, subject: 'Ihre Anfrage ist eingegangen', html: customerHtml });
        await conn.commit();
        res.json({ dealersNotified: matched.length, inquiryId });
    }
    catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
    finally {
        conn.release();
    }
});
exports.default = router;
