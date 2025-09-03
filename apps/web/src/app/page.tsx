import Link from 'next/link';
import { Hero } from '../components/Hero';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { Trust } from '../components/Trust';
import { CategoryCard } from '../components/CategoryCard';
import { CategoriesHover } from '../components/CategoriesHover';
import { env } from '../lib/env';

export default function HomePage() {
  return (
    <main className="space-y-16">
      <div className="container pt-12">
        <Hero />
      </div>
      {/* Kategorien */}
      <CategoriesTeaser />
      <Trust />
      <FloatingCartButton />
    </main>
  );
}

async function CategoriesTeaser() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' });
    const cats = await res.json();
    if (!Array.isArray(cats) || cats.length === 0) return null;
    const top = cats; // alle Hauptkategorien
    return (
      <section className="container space-y-6">
        <h2 className="text-xl font-semibold">Kategorien</h2>
        <CategoriesHover apiBase={env.NEXT_PUBLIC_API_BASE} categories={top} pillClassName="w-64" />
      </section>
    );
  } catch {
    return null;
  }
}


