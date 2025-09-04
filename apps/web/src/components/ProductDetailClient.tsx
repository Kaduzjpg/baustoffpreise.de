"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';

export type Variant = { id: number; productId: number; format?: string | null; variant?: string | null; unit?: string | null; sku?: string | null; imageUrl?: string | null };
export type Spec = { id: number; productId: number; variantId?: number | null; format?: string | null; variant?: string | null; specKey: string; specValue: string };

export function ProductDetailClient({
  name,
  slug,
  imageUrl,
  description,
  unit,
  variants = [],
  specs = []
}: {
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  unit?: string | null;
  variants?: Variant[];
  specs?: Spec[];
}) {
  const formats = useMemo(() => Array.from(new Set(variants.map(v => (v.format || '').trim()).filter(Boolean))), [variants]);
  const [format, setFormat] = useState<string | undefined>(formats[0]);
  const variantsForFormat = useMemo(() => variants.filter(v => (v.format || '') === (format || '')), [variants, format]);
  const variantNames = useMemo(() => Array.from(new Set(variantsForFormat.map(v => (v.variant || '').trim()).filter(Boolean))), [variantsForFormat]);
  const [variantName, setVariantName] = useState<string | undefined>(variantNames[0]);
  const selected = useMemo(() => variantsForFormat.find(v => (v.variant || '') === (variantName || '')) || variantsForFormat[0] || variants[0], [variantsForFormat, variantName, variants]);
  const effectiveUnit = selected?.unit || unit || 'Stück';

  const filteredSpecs = useMemo(() => {
    const f = (format || '').trim();
    const vr = (variantName || '').trim();
    const list = (specs || []).filter(s => {
      if (s.format && s.format !== f) return false;
      if (s.variant && s.variant !== vr) return false;
      return true;
    });
    return list.length ? list : specs;
  }, [specs, format, variantName]);

  const [qty, setQty] = useState<number>(1);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-semibold leading-tight">{name}</h1>
      {description && <p className="text-slate-700 whitespace-pre-line">{description}</p>}

      {formats.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Format</div>
          <div className="flex flex-wrap gap-2">
            {formats.map(f => (
              <button key={f} onClick={() => { setFormat(f); setVariantName(undefined); }} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${format === f ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>{f}</button>
            ))}
          </div>
        </div>
      )}

      {variantNames.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Variante</div>
          <div className="flex flex-wrap gap-2">
            {variantNames.map(v => (
              <button key={v} onClick={() => setVariantName(v)} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${variantName === v ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>{v}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div>
          <label htmlFor="qty" className="block text-sm text-slate-600">Menge</label>
          <div className="inline-flex items-center rounded-full border">
            <button type="button" aria-label="Verringern" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-lg">−</button>
            <input id="qty" title="Menge" placeholder="1" inputMode="numeric" pattern="[0-9]*" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} className="w-20 text-center outline-none" />
            <button type="button" aria-label="Erhöhen" onClick={() => setQty(qty + 1)} className="px-3 py-2 text-lg">+</button>
          </div>
        </div>
        <div className="pb-2 text-sm text-slate-700">{effectiveUnit}</div>
        <Link href={`/anfragekorb?add=${slug}&qty=${qty}`} className="ml-auto btn-cta">🛒 In Anfragekorb</Link>
      </div>

      {filteredSpecs && filteredSpecs.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-1">Technische Daten</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {filteredSpecs.slice(0, 16).map((s) => (
              <li key={s.id} className="flex justify-between">
                <span className="text-slate-600">{s.specKey}</span>
                <span className="font-medium">{s.specValue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

