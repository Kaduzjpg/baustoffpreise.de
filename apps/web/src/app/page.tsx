import Link from 'next/link';
import { Hero } from '../components/Hero';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { Trust } from '../components/Trust';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { CategoryPill } from '../components/CategoryPill';
import { env } from '../lib/env';

export default function HomePage() {
  return (
    <main className="space-y-16">
      <div className="container pt-12">
        <Hero />
      </div>
      {/* Kategorien */}
      <CategoriesSimpleGrid />
      <PopularProducts />
      <Trust />
      <FloatingCartButton />
    </main>
  );
}

async function CategoriesSimpleGrid() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' });
    const cats = await res.json();
    if (!Array.isArray(cats) || cats.length === 0) return null;
    const top = cats;
    return (
      <section className="container space-y-6">
        <h2 className="text-xl font-semibold">Kategorien</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {top.map((c: any) => (
            <li key={c.id} className="flex">
              <CategoryPill href={`/kategorien/${c.slug}`} className="w-full justify-start px-6 md:px-8">
                {c.name}
              </CategoryPill>
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <Link href="/produkte" className="text-sm underline">Alle Produkte anzeigen</Link>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

type Product = { id: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null };

async function PopularProducts() {
  let products: Product[] = [];
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/list`, { cache: 'no-store' });
    products = ((await res.json()) as Product[]).slice(0, 6);
  } catch {}

  if (!products.length) return null;

  return (
    <section className="container space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Beliebte Baustoffe</h2>
        <Link href="/produkte" className="text-sm underline">Alle Produkte anzeigen</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} unit={p.unit} imageUrl={p.imageUrl || undefined} categoryId={(p as any).categoryId} />
        ))}
      </div>
    </section>
  );
}


