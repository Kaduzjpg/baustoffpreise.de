'use client';
import { useEffect, useState } from 'react';
import { env } from '../../../lib/env';
import { addItem, loadCart, saveCart } from '../../../lib/cart';
import Link from 'next/link';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

type Product = { id: number; name: string; slug: string; unit?: string | null; description?: string | null };

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/by-slug/${params.slug}`);
      setProduct(await res.json());
    })();
  }, [params.slug]);

  if (!product) return <main className="container py-8">Laden…</main>;

  function handleAdd() {
    const cart = loadCart();
    const next = addItem(cart, {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unit: product.unit,
      quantity: qty
    });
    saveCart(next);
    try {
      window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Zum Anfragekorb hinzugefügt', variant: 'success' } }));
    } catch {}
  }

  return (
    <main className="container py-8 space-y-6">
      <Breadcrumbs items={[{ href: '/', label: 'Start' }, { href: '/kategorien', label: 'Kategorien' }, { label: product.slug }]} />
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="text-slate-700">{product.description}</p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-24 border rounded px-2 py-1"
        />
        <button onClick={handleAdd} className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2">
          In Anfragekorb
        </button>
      </div>
    </main>
  );
}


