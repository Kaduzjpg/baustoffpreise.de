"use client";
import { updateItem, removeItem, saveCart } from '../../../lib/cart';
import { useState } from 'react';

type CartItem = { productId: number; name: string; unit?: string; quantity: number; note?: string; format?: string | null; variant?: string | null };

export function CartItems({ items, onChange }: { items: CartItem[]; onChange: (items: CartItem[]) => void }) {
  const [list, setList] = useState<CartItem[]>(items);

  function sync(next: any) {
    setList(next.items || list);
    onChange(next.items || list);
    saveCart(next);
  }

  function onQtyChange(productId: number, quantity: number, format?: string | null, variant?: string | null) {
    const next = updateItem({ items: list } as any, productId, { quantity: Math.max(1, quantity) }, format, variant);
    sync(next);
  }

  function onNoteChange(productId: number, note: string, format?: string | null, variant?: string | null) {
    const next = updateItem({ items: list } as any, productId, { note }, format, variant);
    sync(next);
  }

  function onRemove(productId: number, format?: string | null, variant?: string | null) {
    const next = { items: list.filter((i) => !(i.productId === productId && (i.format || null) === (format || null) && (i.variant || null) === (variant || null))) } as any;
    sync(next);
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((i) => (
          <li key={`${i.productId}-${i.format || ''}-${i.variant || ''}`} className="rounded-2xl border bg-white p-4 shadow-soft flex flex-col gap-3">
            <div className="h-32 md:h-36 w-full rounded-xl bg-slate-100 overflow-hidden" aria-hidden>
              <div className="h-full w-full bg-cover bg-center" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-slate-600">{i.unit}</div>
                {i.format && <div className="text-xs text-slate-600">Format: {i.format}</div>}
                {i.variant && <div className="text-xs text-slate-600">Variante: {i.variant}</div>}
              </div>
              <button
                onClick={() => onRemove(i.productId, i.format || null, i.variant || null)}
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700"
                title="Position entfernen"
              >
                <span aria-hidden>🗑️</span> Entfernen
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">Menge</span>
              <div className="inline-flex items-center rounded-2xl border bg-white">
                <button type="button" className="px-3 py-2 text-lg" onClick={() => onQtyChange(i.productId, Math.max(1, i.quantity - 1), i.format || null, i.variant || null)} aria-label="Verringern">−</button>
                <input type="number" min={1} value={i.quantity} onChange={(e) => onQtyChange(i.productId, Number(e.target.value || 1), i.format || null, i.variant || null)} className="w-16 text-center outline-none" title="Menge" placeholder="1" />
                <button type="button" className="px-3 py-2 text-lg" onClick={() => onQtyChange(i.productId, i.quantity + 1, i.format || null, i.variant || null)} aria-label="Erhöhen">+</button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Notiz (optional)</label>
              <textarea value={i.note || ''} onChange={(e) => onNoteChange(i.productId, e.target.value, i.format || null, i.variant || null)} placeholder="Hinweise für den Händler (max. 255 Zeichen)" className="rounded-2xl border px-3 py-2 bg-white" rows={3} maxLength={255} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


