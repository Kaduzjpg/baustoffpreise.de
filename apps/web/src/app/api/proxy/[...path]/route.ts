import { NextRequest } from 'next/server';
import { env } from '@/lib/env';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const baseStr = String(env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const baseUrl = new URL(baseStr);
    const basePath = baseUrl.pathname.replace(/\/+$/, '');
    const { path } = await params;
    const joinedPath = path.join('/');
    const baseEndsWithApi = /(?:^|\/)api$/.test(basePath);
    const pathStartsWithApi = /^api\//.test(joinedPath);
    const normalizedPath = baseEndsWithApi && pathStartsWithApi ? joinedPath.slice(4) : joinedPath;
    const target = `${baseUrl.origin}${basePath ? basePath : ''}/${normalizedPath}${req.nextUrl.search}`;
    const r = await fetch(target, { headers: { accept: 'application/json' } as any, cache: 'no-store' });
    const body = await r.text();
    return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json', 'x-proxy-target': target } });
  } catch (err: any) {
    const message = (err?.message || 'proxy_failed');
    return new Response(JSON.stringify({ error: 'proxy_failed', message }), { status: 502, headers: { 'content-type': 'application/json', 'x-proxy-target': 'invalid' } });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const baseStr = String(env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const baseUrl = new URL(baseStr);
    const basePath = baseUrl.pathname.replace(/\/+$/, '');
    const { path } = await params;
    const joinedPath = path.join('/');
    const baseEndsWithApi = /(?:^|\/)api$/.test(basePath);
    const pathStartsWithApi = /^api\//.test(joinedPath);
    const normalizedPath = baseEndsWithApi && pathStartsWithApi ? joinedPath.slice(4) : joinedPath;
    const target = `${baseUrl.origin}${basePath ? basePath : ''}/${normalizedPath}`;
    const r = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': req.headers.get('content-type') || 'application/json', 'x-turnstile-token': req.headers.get('x-turnstile-token') || '' } as any,
      body: await req.text(),
      cache: 'no-store'
    });
    const body = await r.text();
    return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json', 'x-proxy-target': target } });
  } catch (err: any) {
    const message = (err?.message || 'proxy_failed');
    return new Response(JSON.stringify({ error: 'proxy_failed', message }), { status: 502, headers: { 'content-type': 'application/json', 'x-proxy-target': 'invalid' } });
  }
}


