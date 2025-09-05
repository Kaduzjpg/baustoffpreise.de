"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { env } from '../lib/env';
import { ProductCard } from './ProductCard';
import type { Product, Category } from '../types/models';

export function ProductsBrowser({ products, categories, pageSize = 12, initialServer, initialFilters }: { products: Product[]; categories: Category[]; pageSize?: number; initialServer?: any; initialFilters?: Partial<Record<'q'|'unit'|'categoryId'|'brand'|'stock'|'radius'|'zip'|'page', string|number>> }) {
  const [q, setQ] = useState(String(initialFilters?.q || ''));
  const [unit, setUnit] = useState(String(initialFilters?.unit || ''));
  const [cat, setCat] = useState(String(initialFilters?.categoryId || ''));
  const [brand, setBrand] = useState(String(initialFilters?.brand || ''));
  const [stock, setStock] = useState(String(initialFilters?.stock || ''));
  const [radius, setRadius] = useState(String(initialFilters?.radius || ''));
  const [zip, setZip] = useState(String(initialFilters?.zip || ''));
  const [page, setPage] = useState(Number(initialFilters?.page || 1));
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('name_asc');
  const [server, setServer] = useState<{ items: Product[]; total: number; page: number; pageSize: number } | null>(initialServer || null);
  const [debouncedQ, setDebouncedQ] = useState(String(initialFilters?.q || ''));

  const units = useMemo(() => Array.from(new Set(products.map(p => (p.unit || '').trim()).filter(Boolean))), [products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(p => {
      if (term && !(`${p.name} ${p.slug}`.toLowerCase().includes(term))) return false;
      if (unit && (p.unit || '') !== unit) return false;
      if (cat) return String(p.categoryId || '') === cat;
      if (brand) {
        const b = (p as any).brand || '';
        if (String(b).toLowerCase() !== brand.toLowerCase()) return false;
      }
      if (stock) {
        const s = (p as any).stockType || '';
        if (s !== stock) return false;
      }
      // radius (dealer lookup) – hier nur Platzhalter-Filter, Backend nötig
      return true;
    });
  }, [products, q, unit, cat]);

  // Debounce Suchtext
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // SSR/CSR Hybrid: Bei Interaktion auf serverseitige Suche wechseln
  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const sp = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      q: debouncedQ,
      unit,
      categoryId: cat,
      brand,
      stock,
      radius,
      zip,
      sort
    });
    fetch(`/api/proxy/api/products/search?${sp.toString()}`, { signal: controller.signal, cache: 'no-store' })
      .then(r => r.json())
      .then(j => setServer(j))
      .catch(() => setServer(null))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedQ, unit, cat, brand, stock, radius, zip, sort, page, pageSize]);

  // URL-Persistenz
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (unit) params.set('unit', unit);
    if (cat) params.set('categoryId', cat);
    if (brand) params.set('brand', brand);
    if (stock) params.set('stock', stock);
    if (radius) params.set('radius', radius);
    if (zip) params.set('zip', zip);
    if (sort && sort !== 'name_asc') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    if (pageSize !== 12) params.set('pageSize', String(pageSize));
    const qs = params.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    window.history.replaceState(null, '', url);
  }, [q, unit, cat, brand, stock, radius, zip, sort, page, pageSize]);

  const total = server?.total ?? filtered.length;
  const current = server?.page ?? page;
  const totalPages = Math.max(1, Math.ceil(total / (server?.pageSize ?? pageSize)));
  const sliced = server?.items ?? filtered.slice((current - 1) * pageSize, current * pageSize);

  function go(n: number) {
    const next = Math.min(Math.max(1, n), totalPages);
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Skeleton, wenn noch keine Produkte geliefert wurden
  if (!products || products.length === 0) {
    return (
      <div className="space-y-6" aria-busy>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-3 shadow-soft">
              <div className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
              <div className="mt-3 h-4 rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasActiveFilters = !!(q || unit || cat || brand || stock || radius || zip);
  const clearAll = () => {
    setQ('');
    setUnit('');
    setCat('');
    setBrand('');
    setStock('');
    setRadius('');
    setZip('');
    setSort('name_asc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Suche" className="border rounded px-3 py-2" aria-label="Suche" />
        <select value={unit} onChange={(e) => { setUnit(e.target.value); setPage(1); }} className="border rounded px-3 py-2" aria-label="Einheit filtern">
          <option value="">Alle Einheiten</option>
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} className="border rounded px-3 py-2" aria-label="Kategorie filtern">
          <option value="">Alle Kategorien</option>
          {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <input value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }} placeholder="Hersteller" className="border rounded px-3 py-2" aria-label="Hersteller" />
        <select value={stock} onChange={(e) => { setStock(e.target.value); setPage(1); }} className="border rounded px-3 py-2" aria-label="Lager/Bestellware">
          <option value="">Lager/Bestellware</option>
          <option value="lager">Lagerware</option>
          <option value="bestell">Bestellware</option>
        </select>
        <select value={radius} onChange={(e) => { setRadius(e.target.value); setPage(1); }} className="border rounded px-3 py-2" aria-label="Liefergebiet (Radius)">
          <option value="">Liefergebiet</option>
          {[10,20,30,50,75,100].map(r => <option key={r} value={String(r)}>{r} km</option>)}
        </select>
        <input value={zip} onChange={(e) => { setZip(e.target.value); setPage(1); }} placeholder="PLZ" className="border rounded px-3 py-2" aria-label="PLZ" pattern="\d{5}" />
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="border rounded px-3 py-2" aria-label="Sortierung">
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>
      </div>
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {q && (
            <button className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm" onClick={() => { setQ(''); setPage(1); }} aria-label="Suche entfernen">Suche: {q} ×</button>
          )}
          {unit && (
            <button className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm" onClick={() => { setUnit(''); setPage(1); }} aria-label="Einheit entfernen">Einheit: {unit} ×</button>
          )}
          {cat && (
            <button className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm" onClick={() => { setCat(''); setPage(1); }} aria-label="Kategorie entfernen">Kategorie ×</button>
          )}
          {brand && (
            <button className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm" onClick={() => { setBrand(''); setPage(1); }} aria-label="Marke entfernen">Marke: {brand} ×</button>
          )}
          {stock && (
            <button className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm" onClick={() => { setStock(''); setPage(1); }} aria-label="Verfügbarkeit entfernen">Verfügbarkeit: {stock} ×</button>
          )}
          {radius && (
            <button className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm" onClick={() => { setRadius(''); setPage(1); }} aria-label="Radius entfernen">Radius: {radius} km ×</button>
          )}
          {zip && (
            <button className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm" onClick={() => { setZip(''); setPage(1); }} aria-label="PLZ entfernen">PLZ: {zip} ×</button>
          )}
          <button type="button" className="btn-primary ml-2" onClick={clearAll} aria-label="Alle Filter zurücksetzen">Alle Filter zurücksetzen</button>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" aria-busy>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-3 shadow-soft">
              <div className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
              <div className="mt-3 h-4 rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : sliced.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sliced.map(p => (
            <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} unit={p.unit} imageUrl={p.imageUrl || undefined} />
          ))}
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border bg-white p-6 text-sm text-slate-700">
          <div>Keine Treffer – probiere eine andere Kategorie oder passe die Filter an.</div>
          <div className="flex flex-wrap gap-2">
            {(categories || []).slice(0, 8).map((c) => (
              <Link key={c.id} href={`/kategorien/${c.slug}`} className="inline-flex items-center rounded-2xl border px-3 py-1.5 hover:bg-slate-50">
                {c.name}
              </Link>
            ))}
            <button
              type="button"
              className="inline-flex items-center rounded-2xl border px-3 py-1.5 hover:bg-slate-50"
              onClick={() => {
                setQ('');
                setUnit('');
                setCat('');
                setBrand('');
                setStock('');
                setRadius('');
                setPage(1);
              }}
              aria-label="Filter zurücksetzen"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          {(current - 1) * pageSize + 1}-{Math.min(current * pageSize, total)} von {total}
          {typeof (server as any)?.dealersFound === 'number' && (
            <span className="ml-3 text-xs">Händler im Radius: {(server as any)?.dealersFound}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline" onClick={() => go(current - 1)} disabled={current <= 1}>Zurück</button>
          <button className="btn-primary" onClick={() => go(current + 1)} disabled={current >= totalPages}>Weiter</button>
        </div>
      </div>
    </div>
  );
}


