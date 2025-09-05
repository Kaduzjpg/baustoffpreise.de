"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const nanoid_1 = require("nanoid");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
// Optional Sentry init for API
if (process.env.SENTRY_DSN) {
    try {
        const Sentry = require('@sentry/node');
        Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
    }
    catch { }
}
const env_1 = require("./env");
const db_1 = require("./db");
const express_2 = require("express");
const dealers_1 = __importDefault(require("./routes/dealers"));
const inquiry_1 = __importDefault(require("./routes/inquiry"));
const products_1 = __importDefault(require("./routes/products"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: false
}));
// Request ID + structured logging
app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || (0, nanoid_1.nanoid)(10);
    res.setHeader('x-request-id', req.id);
    next();
});
// JSON logs without personenbezogene Daten (keine Bodies)
morgan_1.default.token('id', (req) => String(req.id || ''));
app.use((0, morgan_1.default)((tokens, req, res) => {
    const log = {
        ts: new Date().toISOString(),
        level: 'info',
        requestId: tokens.id(req, res),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res) || 0),
        length: tokens.res(req, res, 'content-length') || '0',
        responseTimeMs: Number(tokens['response-time'](req, res) || 0),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };
    return JSON.stringify(log);
}));
app.use((0, express_2.json)({ limit: '1mb' }));
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({ points: 60, duration: 60 });
const inquiryLimiter = new rate_limiter_flexible_1.RateLimiterMemory({ points: 5, duration: 60 });
app.use(async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip || 'unknown');
        next();
    }
    catch {
        res.status(429).json({ error: 'Too many requests' });
    }
});
app.get('/healthz', async (_req, res) => {
    try {
        await db_1.pool.query('SELECT 1');
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'db' });
    }
});
app.use('/api/dealers', dealers_1.default);
app.use('/api/inquiry', async (req, res, next) => {
    try {
        await inquiryLimiter.consume(req.ip || 'unknown');
        next();
    }
    catch {
        res.status(429).json({ error: 'Too many inquiries' });
    }
}, inquiry_1.default);
app.use('/api/products', products_1.default);
app.use((err, _req, res, _next) => {
    // Central error handler
    try {
        const rid = _req?.id;
        console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'error', requestId: rid, msg: err?.message || 'Unhandled error' }));
    }
    catch {
        console.error(err);
    }
    res.status(err?.status || 500).json({ error: 'Internal Server Error' });
});
app.listen(Number(env_1.env.PORT), () => {
    console.log(`API listening on :${env_1.env.PORT}`);
});
