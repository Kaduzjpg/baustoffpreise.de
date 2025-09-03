"use client";
import { useMemo, useState } from 'react';
import { ProductCard } from './ProductCard';

export type Product = { id: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null; categoryId?: number };
export type Category = { id: number; name: string; slug: string };

export function ProductsBrowser({ products, categories, pageSize = 12 }: { products: Product[]; categories: Category[]; pageSize?: number }) {
  const [q, setQ] = useState('');
  const [unit, setUnit] = useState('');
  const [cat, setCat] = useState('');
  const [page, setPage] = useState(1);

  const units = useMemo(() => Array.from(new Set(products.map(p => (p.unit || '').trim()).filter(Boolean))), [products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(p => {
      if (term && !(`${p.name} ${p.slug}`.toLowerCase().includes(term))) return false;
      if (unit && (p.unit || '') !== unit) return false;
      if (cat) return String(p.categoryId || '') === cat;
      return true;
    });
  }, [products, q, unit, cat]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const sliced = filtered.slice((current - 1) * pageSize, current * pageSize);

  function go(n: number) {
    const next = Math.min(Math.max(1, n), totalPages);
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Suche" className="border rounded px-3 py-2" />
        <select value={unit} onChange={(e) => { setUnit(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">Alle Einheiten</option>
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} className="border rounded px-3 py-2 md:col-span-2">
          <option value="">Alle Kategorien</option>
          {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sliced.map(p => (
          <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} unit={p.unit} imageUrl={p.imageUrl || undefined} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">{(current - 1) * pageSize + 1}-{Math.min(current * pageSize, total)} von {total}</div>
        <div className="flex items-center gap-2">
          <button className="btn-outline" onClick={() => go(current - 1)} disabled={current <= 1}>Zurück</button>
          <button className="btn-primary" onClick={() => go(current + 1)} disabled={current >= totalPages}>Weiter</button>
        </div>
      </div>
    </div>
  );
}


