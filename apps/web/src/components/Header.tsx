"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileNav } from './MobileNav';
import { CategoriesMega } from './MegaMenu';
import { loadFavorites } from '../lib/favorites';

export function Header() {
  const [count, setCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [q, setQ] = useState('');
  const router = useRouter();
  useEffect(() => {
    const onUpdate = (e: any) => setCount(e?.detail?.count ?? 0);
    window.addEventListener('cart:updated', onUpdate);
    const updateFav = () => setFavCount(loadFavorites().ids.length);
    updateFav();
    window.addEventListener('favorites:updated', updateFav);
    return () => window.removeEventListener('cart:updated', onUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container h-16 flex items-center gap-6">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap text-ink">
          <span className="inline-block h-7 w-7 rounded bg-brand-green" aria-hidden />
          Anfrage-Shop
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm relative">
          <CategoriesMega />
          <Link href="/produkte" className="hover:underline">Produkte</Link>
          <Link href="#so-funktionierts" className="hover:underline">So funktioniert’s</Link>
        </nav>
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
        <nav className="hidden md:flex items-center gap-4 text-sm ml-auto relative">
          <Link href="/favoriten" className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
            <span>☆</span>
            <span>Favoriten</span>
            {favCount > 0 && (
              <span aria-label="Favoriten" className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-xs font-medium text-white">{favCount}</span>
            )}
          </Link>
          <Link href="/anfrage/absenden" className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
            <span>🛒</span>
            <span>Anfragekorb</span>
            {count > 0 && (
              <span aria-label="Positionen im Anfragekorb" className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green px-1 text-xs font-medium text-white">
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


