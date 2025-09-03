"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { env } from '../lib/env';
import { CategoryPill } from './CategoryPill';

type Category = { id: number; name: string; slug: string };
type Sub = { id: number; categoryId: number; name: string; slug: string };

export function CategoriesMega() {
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [subs, setSubs] = useState<Record<string, Sub[]>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeTimeout = useRef<number | null>(null);

  useEffect(() => {
    fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' })
      .then(r => r.json())
      .then((j) => setCats(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  // Lade alle Unterkategorien vor, sobald Kategorien da sind
  useEffect(() => {
    if (!cats.length) return;
    let cancelled = false;
    (async () => {
      try {
        const entries = await Promise.all(
          cats.map(async (c) => {
            try {
              const r = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/subcategories/${c.slug}`, { cache: 'no-store' });
              if (!r.ok) return [c.slug, [] as Sub[]] as const;
              const j = await r.json();
              return [c.slug, (Array.isArray(j) ? j : []) as Sub[]] as const;
            } catch {
              return [c.slug, [] as Sub[]] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, Sub[]> = {};
          for (const [slug, list] of entries) map[slug] = list;
          setSubs(map);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [cats]);

  return (
    <div className="relative" ref={containerRef}
      onMouseEnter={() => {
        if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
        closeTimeout.current = window.setTimeout(() => setOpen(false), 600);
      }}
    >
      <button type="button" className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
        Kategorien
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[980px] max-w-[95vw] rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="grid grid-cols-4 gap-5">
            {cats.map((c) => (
              <div key={c.id}>
                <div className="mb-2 font-medium"><Link href={`/kategorien/${c.slug}`} className="hover:underline">{c.name}</Link></div>
                <ul className="space-y-1.5 text-sm">
                  {(subs[c.slug] || []).slice(0, 6).map(s => (
                    <li key={s.id}>
                      <Link href={`/kategorien/${s.slug}`} className="block rounded-xl px-3 py-1.5 hover:bg-slate-50">{s.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


