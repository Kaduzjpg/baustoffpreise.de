import Link from 'next/link';
import { env } from '../../../lib/env';

type Variant = { id: number; productId: number; format?: string | null; variant?: string | null; unit?: string | null; sku?: string | null; imageUrl?: string | null };
type Spec = { id: number; productId: number; variantId?: number | null; format?: string | null; variant?: string | null; specKey: string; specValue: string };
type Download = { id: number; productId: number; title: string; url: string };
type Product = { id: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null; description?: string | null; variants?: Variant[]; specs?: Spec[]; downloads?: Download[] };

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: Product | null = null;
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/by-slug/${params.slug}`, { cache: 'no-store' });
    if (res.ok) product = await res.json();
  } catch {}

  if (!product) {
    return (
      <main className="container py-10">
        <h1 className="text-2xl font-semibold mb-4">Produkt nicht gefunden</h1>
        <Link href="/produkte" className="underline">Zurück zu Produkten</Link>
      </main>
    );
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const formats = Array.from(new Set(variants.map(v => (v.format || '').trim()).filter(Boolean)));
  const variantsByFormat: Record<string, Variant[]> = Object.fromEntries(formats.map(f => [f, variants.filter(v => (v.format || '') === f)]));

  return (
    <main className="container py-10 space-y-8">
      <nav className="text-sm text-slate-600"><Link href="/">Start</Link> / <Link href="/produkte">Produkte</Link> / <span className="text-slate-900">{product.name}</span></nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-3xl overflow-hidden border bg-white shadow-soft aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'})` }} />
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold leading-tight">{product.name}</h1>
          {product.unit && <div className="text-sm text-slate-600">Einheit: {product.unit}</div>}
          {product.description && <p className="text-slate-700 whitespace-pre-line">{product.description}</p>}
          {/* Varianten/Format Auswahl */}
          {formats.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Format</div>
              <div className="flex flex-wrap gap-2">
                {formats.map(f => (
                  <Link key={f} href={`?format=${encodeURIComponent(f)}`} className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-slate-50">{f}</Link>
                ))}
              </div>
            </div>
          )}
          {/* Technische Daten (vereinfachte Anzeige) */}
          {Array.isArray(product.specs) && product.specs.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">Technische Daten</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {product.specs.slice(0, 12).map(s => (
                  <li key={s.id} className="flex justify-between">
                    <span className="text-slate-600">{s.specKey}</span>
                    <span className="font-medium">{s.specValue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <Link href={`/anfragekorb?add=${product.slug}`} className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/90">In Anfragekorb</Link>
          </div>
        </div>
      </div>
      {/* Downloads / Wird oft zusammen angefragt */}
      {Array.isArray(product.downloads) && product.downloads.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Downloads</h2>
          <ul className="list-disc pl-6 text-sm">
            {product.downloads.map(d => (
              <li key={d.id}><a href={d.url} target="_blank" className="underline">{d.title}</a></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}


