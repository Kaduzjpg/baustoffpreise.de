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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="font-medium mb-1">1. Produkte auswählen</div>
          <p className="text-sm text-slate-700">Produkte im Katalog aussuchen und in den Anfragekorb legen.</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="font-medium mb-1">2. Kontaktdaten angeben</div>
          <p className="text-sm text-slate-700">Im 3‑Schritt‑Formular Kontaktdaten und Optionen eintragen.</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="font-medium mb-1">3. Händler erhalten E‑Mail</div>
          <p className="text-sm text-slate-700">Passende Händler in deiner Region bekommen die Anfrage per E‑Mail.</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="font-medium mb-1">4. Angebote vergleichen</div>
          <p className="text-sm text-slate-700">Händler antworten in 24–48 h. Du vergleichst und triffst deine Wahl.</p>
        </div>
      </div>
      <div>
        <a href="/so-funktionierts" className="underline text-sm">Mehr erfahren</a>
      </div>
    </section>
  );
}

async function DealersCarousel() {
  try {
    const health = await fetch(`${env.NEXT_PUBLIC_API_BASE}/healthz`, { cache: 'no-store' });
    if (!health.ok) return null;
    const h = await health.json();
    if (!h?.ok) return null;

    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/dealers/list`, { cache: 'no-store' });
    const dealers = (await res.json()) as { id: number; name: string; city?: string }[];
    if (!Array.isArray(dealers) || dealers.length === 0) return null;
    return (
      <section className="container space-y-6">
        <h2 className="text-xl font-semibold">Unsere Händler</h2>
        <div className="flex items-center gap-6 overflow-x-auto py-2">
          {dealers.map((d) => (
            <div key={d.id} className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm opacity-80">
              <span aria-hidden>🏬</span>
              <span>{d.name}{d.city ? `, ${d.city}` : ''}</span>
            </div>
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

async function CategoriesWithHover() {
  try {
    const health = await fetch(`${env.NEXT_PUBLIC_API_BASE}/healthz`, { cache: 'no-store' });
    if (!health.ok) return null;
    const h = await health.json();
    if (!h?.ok) return null;

    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' });
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
    const health = await fetch(`${env.NEXT_PUBLIC_API_BASE}/healthz`, { cache: 'no-store' });
    if (!health.ok) return null;
    const h = await health.json();
    if (!h?.ok) return null;

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


