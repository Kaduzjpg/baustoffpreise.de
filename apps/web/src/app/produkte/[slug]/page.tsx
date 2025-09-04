import Link from 'next/link';
import { env } from '../../../lib/env';
import { ProductDetailClient } from '../../../components/ProductDetailClient';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

type Variant = { id: number; productId: number; format?: string | null; variant?: string | null; unit?: string | null; sku?: string | null; imageUrl?: string | null };
type Spec = { id: number; productId: number; variantId?: number | null; format?: string | null; variant?: string | null; specKey: string; specValue: string };
type Download = { id: number; productId: number; title: string; url: string };
type BundleItem = { id: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null };
type Product = { id: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null; description?: string | null; variants?: Variant[]; specs?: Spec[]; downloads?: Download[]; bundles?: BundleItem[] };

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

  return (
    <main className="container py-8 space-y-8">
      <Breadcrumbs items={[{ href: '/', label: 'Start' }, { href: '/produkte', label: 'Produkte' }, { label: product.name }]} />
      <h1 className="text-3xl font-semibold leading-tight">{product.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galerie */}
        <div className="space-y-3">
          <div className="rounded-3xl overflow-hidden border bg-white shadow-soft aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'})` }} />
          {/* Platzhalter für Thumbnails (1-3) */}
          <div className="grid grid-cols-3 gap-2">
            {[product.imageUrl, product.imageUrl, product.imageUrl].slice(0, 3).map((img, idx) => (
              <div key={idx} className="aspect-[4/3] rounded-xl border bg-white shadow-soft bg-cover bg-center" style={{ backgroundImage: `url(${img || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'})` }} />
            ))}
          </div>
        </div>

        {/* Rechte Spalte: Info & CTA */}
        <div className="space-y-4">
          <ProductDetailClient
            name={product.name}
            slug={product.slug}
            imageUrl={product.imageUrl}
            description={product.description || undefined}
            unit={product.unit || undefined}
            variants={(product.variants as any) || []}
            specs={(product.specs as any) || []}
          />
          <div className="text-xs text-slate-600">Kostenlos & unverbindlich. Antwort i. d. R. &lt;48 h&gt;.</div>
        </div>
      </div>

      {/* Downloads */}
      {Array.isArray(product.downloads) && product.downloads.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Downloads</h2>
          <div>
            <a href={product.downloads[0].url} target="_blank" className="btn btn-outline">Datenblatt (PDF) öffnen</a>
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-soft text-center">
          <div className="font-medium">50+ Händler in deiner Region</div>
          <div className="text-xs text-slate-600">Breites Netzwerk</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft text-center">
          <div className="font-medium">Sichere Anfrage</div>
          <div className="text-xs text-slate-600">Übermittlung per E-Mail</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft text-center">
          <div className="font-medium">Kostenlos & unverbindlich</div>
          <div className="text-xs text-slate-600">Antwort i. d. R. &lt;48 h&gt;</div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">FAQ</h2>
        <details className="rounded-2xl border bg-white p-4 shadow-soft">
          <summary className="cursor-pointer font-medium">Wie funktioniert die Anfrage?</summary>
          <p className="mt-2 text-sm text-slate-700">Produkte in den Anfragekorb legen, Kontaktdaten angeben und absenden. Händler antworten dir per E-Mail.</p>
        </details>
        <details className="rounded-2xl border bg-white p-4 shadow-soft">
          <summary className="cursor-pointer font-medium">Wann erhalte ich Angebote?</summary>
          <p className="mt-2 text-sm text-slate-700">In der Regel innerhalb von 48 Stunden, abhängig von Produkt und Region.</p>
        </details>
        <details className="rounded-2xl border bg-white p-4 shadow-soft">
          <summary className="cursor-pointer font-medium">Wie hoch sind die Lieferkosten?</summary>
          <p className="mt-2 text-sm text-slate-700">Die Lieferkosten hängen von Menge, Entfernung und Produkt ab. Du erhältst sie im Händlerangebot.</p>
        </details>
      </section>

      {/* Bundles */}
      {Array.isArray(product.bundles) && product.bundles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Wird oft zusammen angefragt</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {product.bundles.map((b) => (
              <li key={b.id}>
                <a href={`/produkte/${b.slug}`} className="block rounded-2xl border overflow-hidden bg-white shadow-soft hover:shadow-md transition">
                  <div className="aspect-[3/2] bg-cover bg-center" style={{ backgroundImage: `url(${b.imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'})` }} />
                  <div className="p-2 text-sm">{b.name}</div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}


