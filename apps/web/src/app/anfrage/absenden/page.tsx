'use client';
import { useEffect, useMemo, useState } from 'react';
import { env } from '../../../lib/env';
import { loadCart, clearCart, saveCart } from '../../../lib/cart';
import Link from 'next/link';

export default function SubmitInquiryPage() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState(loadCart());
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    customerZip: '',
    radiusKm: 50,
    message: '',
    consent: false
  });
  const [lookupCount, setLookupCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (/^\d{5}$/.test(form.customerZip)) {
      const controller = new AbortController();
      const url = new URL(`${env.NEXT_PUBLIC_API_BASE}/api/dealers/lookup`);
      url.searchParams.set('zip', form.customerZip);
      url.searchParams.set('radius', String(form.radiusKm));
      fetch(url.toString(), { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setLookupCount(d.dealersFound))
        .catch(() => {});
      return () => controller.abort();
    } else {
      setLookupCount(null);
    }
  }, [form.customerZip, form.radiusKm]);

  const itemsForSubmit = useMemo(
    () => cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity, note: i.note })),
    [cart.items]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.consent) {
      setError('Bitte stimmen Sie den Bedingungen zu.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.customerEmail)) {
      setError('Bitte eine gültige E-Mail angeben.');
      return;
    }
    if (!/^\d{5}$/.test(form.customerZip)) {
      setError('Bitte eine gültige PLZ angeben.');
      return;
    }
    if (cart.items.length === 0) {
      setError('Der Anfragekorb ist leer.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/inquiry/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: form.customerEmail,
          customerName: form.customerName,
          customerPhone: form.customerPhone || undefined,
          customerZip: form.customerZip,
          radiusKm: form.radiusKm,
          message: form.message || undefined,
          items: itemsForSubmit
        })
      });
      if (!resp.ok) throw new Error('Fehler beim Absenden');
      await resp.json();
      const emptied = clearCart();
      setCart(emptied);
      saveCart(emptied);
      window.location.href = '/danke';
    } catch (e) {
      setError('Absenden fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <main className="container py-8 space-y-6">
      <ol className="flex items-center gap-4 text-sm" aria-label="Checkout Fortschritt">
        <li className="inline-flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-anthracite text-white text-xs">1</span> Produkte prüfen</li>
        <li className="inline-flex items-center gap-2 opacity-70"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-anthracite text-white text-xs">2</span> Kontaktdaten</li>
        <li className="inline-flex items-center gap-2 opacity-70"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-anthracite text-white text-xs">3</span> Anfrage absenden</li>
      </ol>
      <div className="text-sm text-slate-600"><Link href="/anfragekorb">Zurück zum Anfragekorb</Link></div>
      <h1 className="text-2xl font-semibold">Anfrage absenden</h1>

      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required minLength={2} maxLength={160} />
          </div>
          <div>
            <label className="block text-sm mb-1">E-Mail</label>
            <input className="w-full border rounded px-3 py-2" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required type="email" />
          </div>
          <div>
            <label className="block text-sm mb-1">Telefon (optional)</label>
            <input className="w-full border rounded px-3 py-2" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">PLZ</label>
              <input className="w-full border rounded px-3 py-2" value={form.customerZip} onChange={(e) => setForm({ ...form, customerZip: e.target.value })} required pattern="\d{5}" />
            </div>
            <div>
              <label className="block text-sm mb-1">Radius: {form.radiusKm} km</label>
              <input type="range" min={10} max={100} value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: Number(e.target.value) })} className="w-full" />
              {lookupCount != null && (
                <div className="text-xs text-slate-600">Händler im Umkreis: {lookupCount}</div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Nachricht (optional)</label>
            <textarea className="w-full border rounded px-3 py-2" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>Ich stimme den AGB/Datenschutz zu.</span>
          </label>
        </div>

        {error && <div className="text-sm text-red-600" role="alert">{error}</div>}

        <button disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-black text-white hover:bg-slate-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2">
          {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {loading ? 'Wird gesendet…' : 'Anfrage absenden'}
        </button>
      </form>
    </main>
  );
}


