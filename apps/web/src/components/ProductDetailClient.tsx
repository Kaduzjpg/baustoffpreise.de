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
      <h1 className="text-2xl font-semibold leading-tight">{name}</h1>
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
          <input id="qty" title="Menge" placeholder="1" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} className="w-28 border rounded px-3 py-2" />
        </div>
        <div className="pb-2 text-sm text-slate-700">{effectiveUnit}</div>
        <Link href={`/anfragekorb?add=${slug}&qty=${qty}`} className="ml-auto inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/90">In Anfragekorb</Link>
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

"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { addItem, loadCart, saveCart } from '../lib/cart';

type Variant = { id: number; productId: number; format?: string | null; variant?: string | null; unit?: string | null; sku?: string | null; imageUrl?: string | null };
type Spec = { id: number; productId: number; variantId?: number | null; format?: string | null; variant?: string | null; specKey: string; specValue: string };
type Download = { id: number; productId: number; title: string; url: string };
type Bundle = { id: number; name: string; slug: string };

export type ProductDetailData = {
  id: number;
  name: string;
  slug: string;
  unit?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  variants?: Variant[];
  specs?: Spec[];
  downloads?: Download[];
  bundles?: Bundle[];
};

export function ProductDetailClient({ product }: { product: ProductDetailData }) {
  const [quantity, setQuantity] = useState<number>(1);

  const formats = useMemo(() => Array.from(new Set((product.variants || []).map(v => (v.format || '').trim()).filter(Boolean))), [product]);
  const [format, setFormat] = useState<string>(formats[0] || '');
  const variants = useMemo(() => (product.variants || []).filter(v => (format ? (v.format || '') === format : true)), [product, format]);
  const variantNames = useMemo(() => Array.from(new Set(variants.map(v => (v.variant || '').trim()).filter(Boolean))), [variants]);
  const [variant, setVariant] = useState<string>(variantNames[0] || '');
  const activeVariant = useMemo(() => variants.find(v => (variant ? (v.variant || '') === variant : true)), [variants, variant]);

  const specs = useMemo(() => {
    const all = product.specs || [];
    const byFormat = format ? all.filter(s => (s.format || '') === format) : all;
    const byVariant = variant ? byFormat.filter(s => (s.variant || '') === variant || (s.variantId && activeVariant && s.variantId === activeVariant.id)) : byFormat;
    return byVariant;
  }, [product, format, variant, activeVariant]);

  const unit = activeVariant?.unit || product.unit || '';

  function addToCart() {
    const cart = loadCart();
    const state = addItem(cart, { productId: product.id, name: product.name, slug: product.slug, unit, quantity: Math.max(1, Math.floor(quantity)) });
    saveCart(state);
  }

  return (
    <div className="space-y-6">
      {/* Auswahl */}
      {(formats.length > 0 || variantNames.length > 0) && (
        <div className="space-y-3">
          {formats.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="w-24 text-sm text-slate-600" htmlFor="format-select">Format</label>
              <select id="format-select" aria-label="Format" title="Format" value={format} onChange={(e) => { setFormat(e.target.value); setVariant(''); }} className="border rounded px-3 py-2 text-sm">
                {formats.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}
          {variantNames.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="w-24 text-sm text-slate-600" htmlFor="variant-select">Variante</label>
              <select id="variant-select" aria-label="Variante" title="Variante" value={variant} onChange={(e) => setVariant(e.target.value)} className="border rounded px-3 py-2 text-sm">
                {variantNames.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Menge + Einheit */}
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="sr-only">Menge</label>
        <input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} className="w-24 border rounded px-3 py-2" placeholder="Menge" />
        <span className="text-sm text-slate-700">{unit || 'Einheit'}</span>
        <button onClick={addToCart} className="ml-2 inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/90">In Anfragekorb</button>
      </div>

      {/* Technische Daten */}
      {specs.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-1">Technische Daten</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {specs.slice(0, 20).map(s => (
              <li key={s.id} className="flex justify-between">
                <span className="text-slate-600">{s.specKey}</span>
                <span className="font-medium">{s.specValue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Downloads */}
      {Array.isArray(product.downloads) && product.downloads.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-1">Downloads</div>
          <ul className="list-disc pl-6 text-sm">
            {product.downloads.map(d => (
              <li key={d.id}><a href={d.url} target="_blank" className="underline">{d.title}</a></li>
            ))}
          </ul>
        </div>
      )}

      {/* Bundles */}
      {Array.isArray(product.bundles) && product.bundles.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Wird oft zusammen angefragt</div>
          <ul className="flex flex-wrap gap-2 text-sm">
            {product.bundles.map(b => (
              <li key={b.id}><Link className="inline-flex rounded-full border px-3 py-1 hover:bg-slate-50" href={`/produkte/${b.slug}`}>{b.name}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


