"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export type SimpleCategory = { id: number; name: string; slug: string };
type Subcategory = { id: number; categoryId: number; name: string; slug: string };

type Props = {
  apiBase: string;
  categories: SimpleCategory[];
};

export function CategoriesHover({ apiBase, categories }: Props) {
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
    timeoutRef.current = window.setTimeout(() => setOpenSlug(null), 120);
  }

  const items = useMemo(() => categories ?? [], [categories]);

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
      {items.map((c) => {
        const isOpen = openSlug === c.slug;
        const subs = cache[c.slug] || [];
        return (
          <li key={c.id} className="relative" onMouseEnter={() => onEnter(c.slug)} onMouseLeave={onLeave}>
            <Link href={`/kategorien/${c.slug}`} className="inline-flex w-full items-center justify-center rounded border px-3 py-2 hover:bg-slate-50">
              {c.name}
            </Link>
            {isOpen && subs.length > 0 && (
              <div className="absolute left-0 z-20 mt-1 w-64 rounded-xl border bg-white p-2 shadow-lg">
                <ul className="space-y-1">
                  {subs.map((s) => (
                    <li key={s.id}>
                      <Link href={`/kategorien/${c.slug}`} className="block rounded px-2 py-1 hover:bg-slate-50">
                        {s.name}
                      </Link>
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


