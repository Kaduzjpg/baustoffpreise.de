'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { env } from '../../../lib/env';
import { loadCart, clearCart, saveCart, updateItem, removeItem } from '../../../lib/cart';
import Link from 'next/link';

export default function SubmitInquiryPage() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState(loadCart());
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const streetRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const zipRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
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
    const errs: Record<string, string> = {};
    if (cart.items.length === 0) errs.cart = 'Der Anfragekorb ist leer.';
    if (!form.customerName.trim()) errs.customerName = 'Bitte Namen angeben.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.customerEmail)) errs.customerEmail = 'Bitte eine gültige E-Mail angeben.';
    if (form.customerPhone && !/^\+?[0-9 ()-]{6,}$/.test(form.customerPhone)) errs.customerPhone = 'Bitte eine gültige Telefonnummer angeben.';
    if (!form.customerStreet.trim()) errs.customerStreet = 'Bitte Straße und Hausnummer angeben.';
    if (!form.customerCity.trim()) errs.customerCity = 'Bitte Ort angeben.';
    if (!/^\d{5}$/.test(form.customerZip)) errs.customerZip = 'Bitte eine gültige PLZ (5 Ziffern) angeben.';
    if (!form.consent) errs.consent = 'Bitte stimmen Sie den Bedingungen zu.';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      focusFirstError(errs);
      setError('Bitte prüfen Sie die markierten Felder.');
      return;
    }

    // Clientseitige Dateigrößenprüfung
    const tooLarge = (files || []).find((f) => f.size > MAX_FILE_BYTES);
    if (tooLarge) {
      setFieldErrors({ attachments: `Die Datei "${tooLarge.name}" ist größer als 5 MB.` });
      setError('Bitte prüfen Sie die markierten Felder.');
      try { fileRef.current?.focus(); } catch {}
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

  function getStep1Errors() {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs.customerName = 'Bitte Namen angeben.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.customerEmail)) errs.customerEmail = 'Bitte eine gültige E-Mail angeben.';
    if (form.customerPhone && !/^\+?[0-9 ()-]{6,}$/.test(form.customerPhone)) errs.customerPhone = 'Bitte eine gültige Telefonnummer angeben.';
    if (!form.customerStreet.trim()) errs.customerStreet = 'Bitte Straße und Hausnummer angeben.';
    if (!form.customerCity.trim()) errs.customerCity = 'Bitte Ort angeben.';
    if (!/^\d{5}$/.test(form.customerZip)) errs.customerZip = 'Bitte eine gültige PLZ (5 Ziffern) angeben.';
    return errs;
  }

  function onNext() {
    setError(null);
    if (step === 1) {
      const errs = getStep1Errors();
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        setError('Bitte Kontakt- und Adressdaten vollständig und korrekt ausfüllen.');
        focusFirstError(errs);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  }

  function onBack() {
    setError(null);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }

  if (!mounted) return null;

  function focusFirstError(errs: Record<string, string>) {
    const order = ['customerName', 'customerEmail', 'customerPhone', 'customerStreet', 'customerCity', 'customerZip', 'attachments'];
    for (const key of order) {
      if (errs[key]) {
        try {
          if (key === 'customerName') nameRef.current?.focus();
          else if (key === 'customerEmail') emailRef.current?.focus();
          else if (key === 'customerPhone') phoneRef.current?.focus();
          else if (key === 'customerStreet') streetRef.current?.focus();
          else if (key === 'customerCity') cityRef.current?.focus();
          else if (key === 'customerZip') zipRef.current?.focus();
          else if (key === 'attachments') fileRef.current?.focus();
        } catch {}
        break;
      }
    }
  }

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Anfrage</h1>

      {/* Progress Stepper */}
      <ol className="flex items-center gap-4 text-sm" aria-label="Fortschritt">
        <li className="inline-flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">1</span> Produkte</li>
        <li className={`inline-flex items-center gap-2 ${step === 1 ? '' : 'opacity-80'}`}><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">2</span> Kontaktdaten</li>
        <li className={`inline-flex items-center gap-2 ${step === 2 ? '' : 'opacity-80'}`}><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">3</span> Optionen</li>
        <li className={`inline-flex items-center gap-2 ${step === 3 ? '' : 'opacity-80'}`}><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">4</span> Prüfen & Absenden</li>
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

      {/* Wizard */}
      <form onSubmit={step === 3 ? onSubmit : (e) => e.preventDefault()} className="space-y-4 max-w-xl">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              {fieldErrors.customerName ? (
                <input ref={nameRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerName} onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setFieldErrors((fe) => ({ ...fe, customerName: '' })); }} required minLength={2} maxLength={160} title="Name" placeholder="Max Mustermann" aria-invalid="true" aria-describedby="err-customerName" />
              ) : (
                <input ref={nameRef} className={`w-full border rounded px-3 py-2`} value={form.customerName} onChange={(e) => { setForm({ ...form, customerName: e.target.value }); }} required minLength={2} maxLength={160} title="Name" placeholder="Max Mustermann" />
              )}
              {fieldErrors.customerName && <p id="err-customerName" className="mt-1 text-xs text-red-600">{fieldErrors.customerName}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">E-Mail</label>
              {fieldErrors.customerEmail ? (
                <input ref={emailRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerEmail} onChange={(e) => { setForm({ ...form, customerEmail: e.target.value }); setFieldErrors((fe) => ({ ...fe, customerEmail: '' })); }} required type="email" title="E-Mail" placeholder="name@beispiel.de" aria-invalid="true" aria-describedby="err-customerEmail" />
              ) : (
                <input ref={emailRef} className={`w-full border rounded px-3 py-2`} value={form.customerEmail} onChange={(e) => { setForm({ ...form, customerEmail: e.target.value }); }} required type="email" title="E-Mail" placeholder="name@beispiel.de" />
              )}
              {fieldErrors.customerEmail && <p id="err-customerEmail" className="mt-1 text-xs text-red-600">{fieldErrors.customerEmail}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Telefon (optional)</label>
              {fieldErrors.customerPhone ? (
                <input ref={phoneRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerPhone} onChange={(e) => { setForm({ ...form, customerPhone: e.target.value }); setFieldErrors((fe) => ({ ...fe, customerPhone: '' })); }} title="Telefon" placeholder="01234 567890" pattern="^\+?[0-9 ()-]{6,}$" aria-invalid="true" aria-describedby="err-customerPhone" />
              ) : (
                <input ref={phoneRef} className={`w-full border rounded px-3 py-2`} value={form.customerPhone} onChange={(e) => { setForm({ ...form, customerPhone: e.target.value }); }} title="Telefon" placeholder="01234 567890" pattern="^\+?[0-9 ()-]{6,}$" />
              )}
              {fieldErrors.customerPhone && <p id="err-customerPhone" className="mt-1 text-xs text-red-600">{fieldErrors.customerPhone}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Straße & Nr.</label>
                {fieldErrors.customerStreet ? (
                  <input ref={streetRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerStreet} onChange={(e) => { setForm({ ...form, customerStreet: e.target.value }); setFieldErrors((fe) => ({ ...fe, customerStreet: '' })); }} required minLength={3} maxLength={160} title="Straße & Nr." placeholder="Musterstraße 1" aria-invalid="true" aria-describedby="err-customerStreet" />
                ) : (
                  <input ref={streetRef} className={`w-full border rounded px-3 py-2`} value={form.customerStreet} onChange={(e) => { setForm({ ...form, customerStreet: e.target.value }); }} required minLength={3} maxLength={160} title="Straße & Nr." placeholder="Musterstraße 1" />
                )}
                {fieldErrors.customerStreet && <p id="err-customerStreet" className="mt-1 text-xs text-red-600">{fieldErrors.customerStreet}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Ort</label>
                {fieldErrors.customerCity ? (
                  <input ref={cityRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerCity} onChange={(e) => { setForm({ ...form, customerCity: e.target.value }); setFieldErrors((fe) => ({ ...fe, customerCity: '' })); }} required minLength={2} maxLength={120} title="Ort" placeholder="Musterstadt" aria-invalid="true" aria-describedby="err-customerCity" />
                ) : (
                  <input ref={cityRef} className={`w-full border rounded px-3 py-2`} value={form.customerCity} onChange={(e) => { setForm({ ...form, customerCity: e.target.value }); }} required minLength={2} maxLength={120} title="Ort" placeholder="Musterstadt" />
                )}
                {fieldErrors.customerCity && <p id="err-customerCity" className="mt-1 text-xs text-red-600">{fieldErrors.customerCity}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">PLZ</label>
              {fieldErrors.customerZip ? (
                <input ref={zipRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerZip} onChange={(e) => { setForm({ ...form, customerZip: e.target.value }); setFieldErrors((fe) => ({ ...fe, customerZip: '' })); }} required pattern="\d{5}" title="PLZ" placeholder="12345" aria-invalid="true" aria-describedby="err-customerZip" />
              ) : (
                <input ref={zipRef} className={`w-full border rounded px-3 py-2`} value={form.customerZip} onChange={(e) => { setForm({ ...form, customerZip: e.target.value }); }} required pattern="\d{5}" title="PLZ" placeholder="12345" />
              )}
              {fieldErrors.customerZip && <p id="err-customerZip" className="mt-1 text-xs text-red-600">{fieldErrors.customerZip}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm mb-1">Radius: {form.radiusKm} km</label>
              <input type="range" min={10} max={100} value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: Number(e.target.value) })} className="w-full" title="Umkreis" />
              {lookupCount != null && (
                <div className="text-xs text-slate-600">Händler im Umkreis: {lookupCount}</div>
              )}
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
                ref={fileRef}
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  const filtered = selected.filter((f) => f.size <= MAX_FILE_BYTES).slice(0, 8);
                  if (selected.length !== filtered.length) {
                    setFieldErrors((fe) => ({ ...fe, attachments: 'Einige Dateien wurden verworfen, da sie größer als 5 MB sind.' }));
                  }
                  setFiles(filtered);
                }}
                title="Anhänge"
              />
              {fieldErrors.attachments && <p className="mt-1 text-xs text-red-600">{fieldErrors.attachments}</p>}
              {files.length > 0 && <div className="text-xs text-slate-600 mt-1">{files.length} Datei(en) ausgewählt</div>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="font-medium">Zusammenfassung</div>
            <ul className="space-y-1">
              <li><strong>Name:</strong> {form.customerName}</li>
              <li><strong>E-Mail:</strong> {form.customerEmail}</li>
              {form.customerPhone && <li><strong>Telefon:</strong> {form.customerPhone}</li>}
              <li><strong>Adresse:</strong> {form.customerStreet}, {form.customerZip} {form.customerCity}</li>
              <li><strong>Radius:</strong> {form.radiusKm} km</li>
              {form.message && <li><strong>Nachricht:</strong> {form.message}</li>}
              <li><strong>Dateien:</strong> {files.length} ausgewählt</li>
              <li><strong>Positionen:</strong> {cart.items.length}</li>
            </ul>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} title="Zustimmung" />
              <span>Ich stimme den AGB/Datenschutz zu.</span>
            </label>
          </div>
        )}

        {error && <div className="text-sm text-red-600" role="alert">{error}</div>}

        <div className="flex items-center gap-3">
          {step > 1 && (
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 px-4 py-2 rounded border bg-white hover:bg-slate-50">Zurück</button>
          )}
          {step < 3 && (
            <button type="button" onClick={onNext} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-black text-white hover:bg-slate-800 disabled:opacity-60">Weiter</button>
          )}
          {step === 3 && (
            <button disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-black text-white hover:bg-slate-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2">
              {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? 'Wird gesendet…' : 'Anfrage absenden'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}


