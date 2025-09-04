"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadCart } from '../lib/cart';

export function FloatingCartButton() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(loadCart().items.length);
    const onUpdate = (e: any) => setCount(e?.detail?.count ?? 0);
    window.addEventListener('cart:updated', onUpdate);
    return () => window.removeEventListener('cart:updated', onUpdate);
  }, []);
  return (
    <Link href="/anfragekorb" className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-brand-green text-white px-5 py-3 shadow-soft hover:scale-[1.03] transition-transform ease-smooth">
      Anfragekorb {count > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-xs">{count}</span>}
    </Link>
  );
}






