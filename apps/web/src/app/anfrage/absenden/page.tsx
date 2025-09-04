'use client';
import { useEffect, useMemo, useState } from 'react';
import { env } from '../../../lib/env';
import { loadCart, clearCart, saveCart, updateItem, removeItem } from '../../../lib/cart';
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
    customerStreet: '',
    customerCity: '',
    radiusKm: 50,
    message: '',
    consent: false
  });
  const [files, setFiles] = useState<File[]>([]);
  const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
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
        .then((d) => {
          setLookupCount(d.dealersFound);
          if (!form.customerCity && d.city) setForm((f) => ({ ...f, customerCity: String(d.city) }));
        })
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

  function onQtyChange(productId: number, quantity: number, format?: string | null, variant?: string | null) {
    const next = updateItem(cart, productId, { quantity: Math.max(1, quantity) }, format, variant);
    setCart(next);
    saveCart(next);
  }

  function onNoteChange(productId: number, note: string, format?: string | null, variant?: string | null) {
    const next = updateItem(cart, productId, { note }, format, variant);
    setCart(next);
    saveCart(next);
  }

  function onRemove(productId: number, format?: string | null, variant?: string | null) {
    const next = removeItem(cart, productId, format, variant);
    setCart(next);
    saveCart(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.consent) {
      setError('Bitte stimmen Sie den Bedingungen zu.');
      return;
    }
    if (!form.customerStreet.trim() || !form.customerCity.trim()) {
      setError('Bitte vollständige Adresse angeben (Straße/Hausnummer und Ort).');
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

    // Clientseitige Dateigrößenprüfung
    const tooLarge = (files || []).find((f) => f.size > MAX_FILE_BYTES);
    if (tooLarge) {
      setError(`Die Datei "${tooLarge.name}" ist größer als 5 MB.`);
      return;
    }

    setLoading(true);
    try {
      // Dateien in Base64 umwandeln
      const attachments = await Promise.all(
        (files || []).slice(0, 8).map(
          (f) =>
            new Promise<{ filename: string; content: string; contentType?: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = String(reader.result || '');
                const base64 = result.includes(',') ? result.split(',')[1] : result;
                resolve({ filename: f.name, content: base64, contentType: f.type || undefined });
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(f);
            })
        )
      );
      const resp = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/inquiry/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: form.customerEmail,
          customerName: form.customerName,
          customerPhone: form.customerPhone || undefined,
          customerZip: form.customerZip,
          customerStreet: form.customerStreet,
          customerCity: form.customerCity,
          radiusKm: form.radiusKm,
          message: form.message || undefined,
          items: itemsForSubmit,
          attachments
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
      <h1 className="text-2xl font-semibold">Anfrage</h1>

      {/* Progress Stepper */}
      <ol className="flex items-center gap-4 text-sm" aria-label="Fortschritt">
        <li className="inline-flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">1</span> Produkte</li>
        <li className="inline-flex items-center gap-2 opacity-80"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">2</span> Kontaktdaten</li>
        <li className="inline-flex items-center gap-2 opacity-80"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">3</span> Radius</li>
        <li className="inline-flex items-center gap-2 opacity-80"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">4</span> Zusammenfassung</li>
      </ol>

      {/* Anfragekorb-Abschnitt */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Deine Produkte</h2>
        {cart.items.length === 0 ? (
          <div className="text-slate-700">
            Dein Anfragekorb ist leer.{' '}
            <Link href="/produkte" className="underline">Jetzt Produkte ansehen</Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-6xl">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cart.items.map((i) => (
                <li key={`${i.productId}-${(i as any).format || ''}-${(i as any).variant || ''}`} className="rounded-2xl border bg-white p-4 shadow-soft flex flex-col gap-3">
                  {/* Bild-Platzhalter */}
                  <div className="h-32 md:h-36 w-full rounded-xl bg-slate-100 overflow-hidden" aria-hidden>
                    <div className="h-full w-full bg-cover bg-center" />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-sm text-slate-600">{i.unit}</div>
                      {(i as any).format && <div className="text-xs text-slate-600">Format: {(i as any).format}</div>}
                      {(i as any).variant && <div className="text-xs text-slate-600">Variante: {(i as any).variant}</div>}
                    </div>
                    <button
                      onClick={() => onRemove(i.productId, (i as any).format || null, (i as any).variant || null)}
                      className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700"
                      title="Position entfernen"
                    >
                      <span aria-hidden>🗑️</span> Entfernen
                    </button>
                  </div>

                  {/* Menge */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Menge</span>
                    <div className="inline-flex items-center rounded-2xl border bg-white">
                      <button
                        type="button"
                        className="px-3 py-2 text-lg"
                        onClick={() => onQtyChange(i.productId, Math.max(1, i.quantity - 1), (i as any).format || null, (i as any).variant || null)}
                        aria-label="Verringern"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={i.quantity}
                        onChange={(e) => onQtyChange(i.productId, Number(e.target.value || 1), (i as any).format || null, (i as any).variant || null)}
                        id={`qty-${i.productId}`}
                        className="w-16 text-center outline-none"
                        title="Menge"
                        placeholder="1"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-lg"
                        onClick={() => onQtyChange(i.productId, i.quantity + 1, (i as any).format || null, (i as any).variant || null)}
                        aria-label="Erhöhen"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Notiz */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm" htmlFor={`note-${i.productId}`}>Notiz (optional)</label>
                    <textarea
                      value={i.note || ''}
                      onChange={(e) => onNoteChange(i.productId, e.target.value, (i as any).format || null, (i as any).variant || null)}
                      id={`note-${i.productId}`}
                      placeholder="Hinweise für den Händler (max. 255 Zeichen)"
                      className="rounded-2xl border px-3 py-2 bg-white"
                      title="Notiz"
                      rows={3}
                      maxLength={255}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Kontaktformular */}
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required minLength={2} maxLength={160} title="Name" placeholder="Max Mustermann" />
          </div>
          <div>
            <label className="block text-sm mb-1">E-Mail</label>
            <input className="w-full border rounded px-3 py-2" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required type="email" title="E-Mail" placeholder="name@beispiel.de" />
          </div>
          <div>
            <label className="block text-sm mb-1">Telefon (optional)</label>
            <input className="w-full border rounded px-3 py-2" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} title="Telefon" placeholder="01234 567890" pattern="^\+?[0-9 ()-]{6,}$" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Straße & Nr.</label>
              <input className="w-full border rounded px-3 py-2" value={form.customerStreet} onChange={(e) => setForm({ ...form, customerStreet: e.target.value })} required minLength={3} maxLength={160} title="Straße & Nr." placeholder="Musterstraße 1" />
            </div>
            <div>
              <label className="block text-sm mb-1">Ort</label>
              <input className="w-full border rounded px-3 py-2" value={form.customerCity} onChange={(e) => setForm({ ...form, customerCity: e.target.value })} required minLength={2} maxLength={120} title="Ort" placeholder="Musterstadt" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">PLZ</label>
              <input className="w-full border rounded px-3 py-2" value={form.customerZip} onChange={(e) => setForm({ ...form, customerZip: e.target.value })} required pattern="\d{5}" title="PLZ" placeholder="12345" />
            </div>
            <div>
              <label className="block text-sm mb-1">Radius: {form.radiusKm} km</label>
              <input type="range" min={10} max={100} value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: Number(e.target.value) })} className="w-full" title="Umkreis" />
              {lookupCount != null && (
                <div className="text-xs text-slate-600">Händler im Umkreis: {lookupCount}</div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Nachricht (optional)</label>
            <textarea className="w-full border rounded px-3 py-2" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} title="Nachricht" placeholder="Ihre Nachricht an die Händler (optional)" />
          </div>
          <div>
            <label className="block text-sm mb-1">Anhänge (max. 8 Dateien, je ≤ 5 MB)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                const filtered = selected.filter((f) => f.size <= MAX_FILE_BYTES).slice(0, 8);
                if (selected.length !== filtered.length) {
                  setError('Einige Dateien wurden verworfen, da sie größer als 5 MB sind.');
                }
                setFiles(filtered);
              }}
              title="Anhänge"
            />
            {files.length > 0 && <div className="text-xs text-slate-600 mt-1">{files.length} Datei(en) ausgewählt</div>}
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} title="Zustimmung" />
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


