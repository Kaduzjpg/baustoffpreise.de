import Link from 'next/link';
import { Hero } from '../components/Hero';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { Trust } from '../components/Trust';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { CategoriesHover } from '../components/CategoriesHover';
import { env } from '../lib/env';

export default function HomePage() {
  return (
    <main className="space-y-16">
      <div className="container pt-12">
        <Hero />
      </div>
      <HowItWorks />
      {/* Kategorien */}
      <CategoriesWithHover />
      <PopularProducts />
      <DealersCarousel />
      <Trust />
      <FloatingCartButton />
    </main>
  );
}
function HowItWorks() {
  return (
    <section id="so-funktionierts" className="container space-y-6">
      <h2 className="text-xl font-semibold">So funktioniert’s</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="font-medium mb-1">Produkte auswählen</div>
          <p className="text-sm text-slate-700">Füge Baustoffe in den Anfragekorb.</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="font-medium mb-1">Anfrage absenden</div>
          <p className="text-sm text-slate-700">Kontaktdaten angeben und abschicken.</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="font-medium mb-1">Angebote vergleichen</div>
          <p className="text-sm text-slate-700">Händler melden sich innerhalb von 24–48 h.</p>
        </div>
      </div>
    </section>
  );
}

function DealersCarousel() {
  // Dummy-Logos – später aus API beziehen
  const logos = [
    'https://dummyimage.com/140x60/000/fff&text=H%C3%A4ndler+A',
    'https://dummyimage.com/140x60/000/fff&text=H%C3%A4ndler+B',
    'https://dummyimage.com/140x60/000/fff&text=H%C3%A4ndler+C',
    'https://dummyimage.com/140x60/000/fff&text=H%C3%A4ndler+D'
  ];
  return (
    <section className="container space-y-6">
      <h2 className="text-xl font-semibold">Unsere Händler</h2>
      <div className="flex items-center gap-6 overflow-x-auto py-2">
        {logos.map((src, i) => (
          <img key={i} src={src} alt={`Händler Logo ${i + 1}`} className="h-10 w-auto opacity-80" />
        ))}
      </div>
    </section>
  );
}

async function CategoriesWithHover() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'force-cache', next: { revalidate: 1200 } });
    const cats = await res.json();
    if (!Array.isArray(cats) || cats.length === 0) return null;
    const top = cats;
    return (
      <section className="container space-y-6">
        <h2 className="text-xl font-semibold">Kategorien</h2>
        <CategoriesHover apiBase={env.NEXT_PUBLIC_API_BASE} categories={top} pillClassName="px-6 md:px-8" />
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
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/list`, { cache: 'force-cache', next: { revalidate: 1200 } });
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


