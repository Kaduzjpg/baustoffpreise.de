export const API_BASE = 'https://api.baustoffpreisevergleichen.de';

export async function lookupDealers(zip, radius) {
  const url = new URL('/api/dealers/lookup', API_BASE);
  url.searchParams.set('zip', String(zip));
  url.searchParams.set('radius', String(radius));
  const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' }, mode: 'cors' });
  if (!res.ok) throw new Error('Lookup failed');
  return await res.json();
}

export async function submitInquiry(payload) {
  const res = await fetch(`${API_BASE}/api/inquiry/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors'
  });
  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch { /* noop */ }
    const msg = err?.error ? JSON.stringify(err.error) : 'Submit failed';
    throw new Error(msg);
  }
  return await res.json();
}


