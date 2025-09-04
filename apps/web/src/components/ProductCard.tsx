"use client";
import { addItem, loadCart, saveCart } from '../lib/cart';
import { useEffect, useMemo, useState } from 'react';
import { env } from '../lib/env';
import { getToneByCategoryId, getToneBySlug } from '../lib/categoryColors';

type Props = {
  id: number;
  name: string;
  slug: string;
  unit?: string | null;
  imageUrl?: string | null;
  categoryId?: number;
  categoriesMeta?: { id: number; slug: string }[]; // optional zur Farbableitung
  categorySlug?: string; // wenn vorhanden, direkte Farbbestimmung
};

export function ProductCard({ id, name, slug, unit, imageUrl, categoryId, categoriesMeta, categorySlug }: Props) {
  const tone = categorySlug ? getToneBySlug(categorySlug) : getToneByCategoryId(categoryId, categoriesMeta);
  const [variants, setVariants] = useState<Array<{ format?: string | null; variant?: string | null; unit?: string | null }>>([]);
  const [format, setFormat] = useState<string | undefined>();
  const [variantName, setVariantName] = useState<string | undefined>();
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/by-slug/${slug}`, { cache: 'no-store' });
        if (!res.ok) return;
        const j = await res.json();
        if (!ignore && Array.isArray(j?.variants)) setVariants(j.variants);
      } catch {}
    })();
    return () => { ignore = true; };
  }, [slug]);

  const formatOptions = useMemo(() => Array.from(new Set((variants || []).map(v => (v.format || '').trim()).filter(Boolean))), [variants]);
  const variantsForFormat = useMemo(() => (variants || []).filter(v => (v.format || '') === (format || '')), [variants, format]);
  const variantOptions = useMemo(() => Array.from(new Set(variantsForFormat.map(v => (v.variant || '').trim()).filter(Boolean))), [variantsForFormat]);
  const effectiveUnit = useMemo(() => {
    const sel = variantsForFormat.find(v => (v.variant || '') === (variantName || '')) || variantsForFormat[0];
    return sel?.unit || unit || 'Stück';
  }, [variantsForFormat, variantName, unit]);
  function addToCart(e?: React.MouseEvent) {
    try { e?.preventDefault(); e?.stopPropagation(); } catch {}
    const cart = loadCart();
    const next = addItem(cart, { productId: id, name, slug, unit: effectiveUnit ?? undefined, quantity: Math.max(1, qty), format, variant: variantName });
    saveCart(next);
    try {
      window.dispatchEvent(new CustomEvent('toast', { detail: { title: `${name} zum Anfragekorb hinzugefügt`, variant: 'success' } }));
    } catch {}
  }

  return (
    <a href={`/produkte/${slug}`} className="group block rounded-3xl border bg-white shadow-soft overflow-hidden transition-transform ease-smooth hover:scale-[1.01] hover:shadow-lg">
      <div
        className="aspect-[3/2] bg-cover bg-center"
        data-bg={imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'}
        style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'})` }}
      />
      <div className="p-2.5 space-y-1">
        <div className="text-sm font-medium leading-tight">{name}</div>
        <div className="text-xs text-slate-600">{effectiveUnit}</div>
        {formatOptions.length > 0 && (
          <div className="pt-1">
            <div className="flex flex-wrap gap-1">
              {formatOptions.map((f) => (
                <button key={f} onClick={(e) => { e.preventDefault(); setFormat(f); setVariantName(undefined); }} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${format === f ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>{f}</button>
              ))}
            </div>
          </div>
        )}
        {variantOptions.length > 0 && (
          <div className="pt-1">
            <div className="flex flex-wrap gap-1">
              {variantOptions.map((v) => (
                <button key={v} onClick={(e) => { e.preventDefault(); setVariantName(v); }} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${variantName === v ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>{v}</button>
              ))}
            </div>
          </div>
        )}
        {/* Menge */}
        <div className="pt-1 flex items-center gap-2">
          <span className="text-xs text-slate-600">Menge</span>
          <div className="inline-flex items-center rounded-full border">
            <button onClick={(e) => { e.preventDefault(); setQty((q) => Math.max(1, q - 1)); }} className="px-2 py-1 text-sm" aria-label="Verringern">−</button>
            <input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} type="number" min={1} className="w-14 text-center outline-none" title="Menge" placeholder="1" />
            <button onClick={(e) => { e.preventDefault(); setQty((q) => q + 1); }} className="px-2 py-1 text-sm" aria-label="Erhöhen">+</button>
          </div>
          <span className="text-xs text-slate-600">{effectiveUnit}</span>
        </div>
        <div className="pt-1.5">
          <button
            onClick={(e) => addToCart(e)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs text-white bg-brand-green hover:bg-brand-green/90 shadow-soft"
          >
            <span>🛒</span>
            <span>In Anfragekorb</span>
          </button>
        </div>
      </div>
    </a>
  );
}


