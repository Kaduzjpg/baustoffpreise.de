"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CategoryPill } from './CategoryPill';

export type SimpleCategory = { id: number; name: string; slug: string };
type Subcategory = { id: number; categoryId: number; name: string; slug: string };

type Props = {
  apiBase: string;
  categories: SimpleCategory[];
  pillClassName?: string;
};

export function CategoriesHover({ apiBase, categories, pillClassName }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, Subcategory[]>>({});
  const timeoutRef = useRef<number | null>(null);

  async function ensureLoaded(slug: string) {
    if (cache[slug]) return;
    try {
      const res = await fetch(`${apiBase}/api/products/subcategories/${slug}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as Subcategory[];
      setCache((prev) => ({ ...prev, [slug]: Array.isArray(data) ? data : [] }));
    } catch {}
  }

  function onEnter(slug: string) {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setOpenSlug(slug);
    void ensureLoaded(slug);
  }

  function onLeave() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setOpenSlug(null), 600);
  }

  const items = useMemo(() => categories ?? [], [categories]);

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-4 text-sm md:text-base">
      {items.map((c) => {
        const isOpen = openSlug === c.slug;
        const subs = cache[c.slug] || [];
        return (
          <li key={c.id} className="relative" onMouseEnter={() => onEnter(c.slug)} onMouseLeave={onLeave}>
            <CategoryPill href={`/kategorien/${c.slug}`} className={pillClassName}>{c.name}</CategoryPill>
            {isOpen && subs.length > 0 && (
              <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <ul className="space-y-1">
                  {subs.map((s) => (
                    <li key={s.id}>
                      <Link href={`/kategorien/${s.slug}`} className="block rounded-xl px-3 py-1.5 hover:bg-slate-50">{s.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}


