import Link from 'next/link';
import { Hero } from '../components/Hero';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { Trust } from '../components/Trust';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { env } from '../lib/env';

export default function HomePage() {
  return (
    <main className="space-y-16">
      <div className="container pt-12">
        <Hero />
      </div>
      {/* Kategorien (klein, ohne Bild) über beliebten Produkten */}
      <CategoriesTeaser />
      <PopularProducts />
      <Trust />
      <FloatingCartButton />
    </main>
  );
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} unit={p.unit} imageUrl={p.imageUrl || undefined} categoryId={(p as any).categoryId} />
        ))}
      </div>
    </section>
  );
}

async function CategoriesTeaser() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' });
    const cats = await res.json();
    if (!Array.isArray(cats) || cats.length === 0) return null;
    const top = cats.slice(0, 6);
    return (
      <section className="container space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Beliebte Kategorien</h2>
          <Link href="/produkte" className="text-sm underline">Alle Produkte anzeigen</Link>
        </div>
        <p className="text-sm text-slate-600">Wähle eine Kategorie – wir zeigen passende Produkte auf der nächsten Seite.</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-sm">
          {top.map((c: any) => (
            <li key={c.id}>
              <Link href={`/kategorien/${c.slug}`} className="inline-flex w-full items-center justify-center rounded border px-3 py-2 hover:bg-slate-50">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  } catch {
    return null;
  }
}


