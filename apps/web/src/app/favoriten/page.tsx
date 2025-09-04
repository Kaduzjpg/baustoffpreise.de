'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { env } from '../../lib/env';
import { ProductCard } from '../../components/ProductCard';
import { loadFavorites } from '../../lib/favorites';
import { addItem, loadCart, saveCart } from '../../lib/cart';

type Product = { id: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null };

export default function FavoritesPage() {
  const [ids, setIds] = useState<number[]>([]);
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    setIds(loadFavorites().ids);
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!ids.length) { setItems([]); return; }
    (async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/list`, { cache: 'force-cache' });
        const list = (await res.json()) as Product[];
        if (!ignore) setItems(list.filter(p => ids.includes(p.id)));
      } catch {
        if (!ignore) setItems([]);
      }
    })();
    return () => { ignore = true; };
  }, [ids]);

  const count = items?.length || 0;

  function addAllToCart() {
    if (!items?.length) return;
    const cart = loadCart();
    let next = cart;
    for (const p of items) {
      next = addItem(next, { productId: p.id, name: p.name, slug: p.slug, unit: p.unit || undefined, quantity: 1 });
    }
    saveCart(next);
    try { window.dispatchEvent(new CustomEvent('toast', { detail: { title: `${items.length} Favoriten zum Anfragekorb hinzugefügt`, variant: 'success' } })); } catch {}
  }

  return (
    <main className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Favoriten</h1>
        {count > 0 && (
          <button onClick={addAllToCart} className="btn-primary">Alle in Anfragekorb</button>
        )}
      </div>
      {!items ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" aria-busy>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-3 shadow-soft">
              <div className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
              <div className="mt-3 h-4 rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-700">
          Noch keine Favoriten. <Link href="/produkte" className="underline">Produkte ansehen</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} unit={p.unit} imageUrl={p.imageUrl || undefined} />
          ))}
        </div>
      )}
    </main>
  );
}


