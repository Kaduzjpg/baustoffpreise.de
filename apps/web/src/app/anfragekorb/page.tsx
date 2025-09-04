'use client';
import Link from 'next/link';
import { loadCart, saveCart, updateItem, removeItem } from '../../lib/cart';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState(loadCart());
  useEffect(() => setMounted(true), []);

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

  if (!mounted) return null;

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Anfragekorb</h1>
      {cart.items.length === 0 ? (
        <div className="text-slate-700">
          Dein Anfragekorb ist leer.{' '}
          <Link href="/kategorien" className="underline">
            Jetzt Produkte ansehen
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((i) => (
            <div key={i.productId} className="border rounded p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-slate-600">{i.unit}</div>
                  {(i as any).format && <div className="text-xs text-slate-600">Format: {(i as any).format}</div>}
                  {(i as any).variant && <div className="text-xs text-slate-600">Variante: {(i as any).variant}</div>}
                </div>
                <button onClick={() => onRemove(i.productId, (i as any).format || null, (i as any).variant || null)} className="text-sm text-red-600 hover:underline">
                  Entfernen
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm" htmlFor={`qty-${i.productId}`}>Menge</label>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => onQtyChange(i.productId, Number(e.target.value), (i as any).format || null, (i as any).variant || null)}
                  id={`qty-${i.productId}`}
                  className="w-24 border rounded px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm" htmlFor={`note-${i.productId}`}>Notiz</label>
                <input
                  type="text"
                  value={i.note || ''}
                  onChange={(e) => onNoteChange(i.productId, e.target.value, (i as any).format || null, (i as any).variant || null)}
                  id={`note-${i.productId}`}
                  placeholder="Optionale Notiz (max. 255 Zeichen)"
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Link href="/anfrage/absenden" className="btn-primary">
              Angebot anfordern
            </Link>
          </div>
          <p className="text-sm text-slate-600">Hinweis: Preise kommen als Angebot per E-Mail.</p>
        </div>
      )}
    </main>
  );
}


