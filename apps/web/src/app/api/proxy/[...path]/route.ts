import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const target = `${process.env.NEXT_PUBLIC_API_BASE}/${params.path.join('/')}${req.nextUrl.search}`;
  const r = await fetch(target, { headers: { accept: 'application/json' } as any, cache: 'no-store' });
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const target = `${process.env.NEXT_PUBLIC_API_BASE}/${params.path.join('/')}`;
  const r = await fetch(target, {
    method: 'POST',
    headers: { 'content-type': req.headers.get('content-type') || 'application/json', 'x-turnstile-token': req.headers.get('x-turnstile-token') || '' },
    body: await req.text(),
    cache: 'no-store'
  });
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
}


