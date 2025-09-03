"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileNav } from './MobileNav';

export function Header() {
  const [count, setCount] = useState(0);
  const [q, setQ] = useState('');
  const router = useRouter();
  useEffect(() => {
    const onUpdate = (e: any) => setCount(e?.detail?.count ?? 0);
    window.addEventListener('cart:updated', onUpdate);
    return () => window.removeEventListener('cart:updated', onUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container h-14 flex items-center gap-4">
        <Link href="/" className="font-semibold tracking-tight whitespace-nowrap">Anfrage-Shop</Link>
        {/* Suche */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const term = q.trim();
            router.push(term ? `/produkte?q=${encodeURIComponent(term)}` : '/produkte');
          }}
          className="hidden md:flex flex-1"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Produkte oder SKU suchen…"
            className="w-full border rounded-full px-4 py-2 text-sm"
            aria-label="Suche"
            suppressHydrationWarning
          />
        </form>
        <nav className="hidden md:flex items-center gap-4 text-sm ml-auto">
          <Link href="/produkte" className="hover:underline">Produkte</Link>
          <Link href="/anfragekorb" className="relative inline-flex items-center gap-2">
            <span>Anfragekorb</span>
            {count > 0 && (
              <span aria-label="Positionen im Anfragekorb" className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs font-medium text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}


