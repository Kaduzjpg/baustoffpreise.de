import { NextRequest } from 'next/server';
import { env } from '@/lib/env';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const base = String(env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const path = params.path.join('/');
    const target = `${base}/${path}${req.nextUrl.search}`;
    const r = await fetch(target, { headers: { accept: 'application/json' } as any, cache: 'no-store' });
    const body = await r.text();
    return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
  } catch (err: any) {
    const message = (err?.message || 'proxy_failed');
    return new Response(JSON.stringify({ error: 'proxy_failed', message }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const base = String(env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const path = params.path.join('/');
    const target = `${base}/${path}`;
    const r = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': req.headers.get('content-type') || 'application/json', 'x-turnstile-token': req.headers.get('x-turnstile-token') || '' } as any,
      body: await req.text(),
      cache: 'no-store'
    });
    const body = await r.text();
    return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
  } catch (err: any) {
    const message = (err?.message || 'proxy_failed');
    return new Response(JSON.stringify({ error: 'proxy_failed', message }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
}


