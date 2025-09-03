import Link from 'next/link';
import { env } from '../../../lib/env';
import { ProductDetailClient } from '../../../components/ProductDetailClient';

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
    <main className="container py-10 space-y-8">
      <nav className="text-sm text-slate-600"><Link href="/">Start</Link> / <Link href="/produkte">Produkte</Link> / <span className="text-slate-900">{product.name}</span></nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-3xl overflow-hidden border bg-white shadow-soft aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'})` }} />
        <ProductDetailClient
          name={product.name}
          slug={product.slug}
          imageUrl={product.imageUrl}
          description={product.description || undefined}
          unit={product.unit || undefined}
          variants={(product.variants as any) || []}
          specs={(product.specs as any) || []}
        />
      </div>
      {Array.isArray(product.downloads) && product.downloads.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Downloads</h2>
          <ul className="list-disc pl-6 text-sm">
            {product.downloads.map((d) => (
              <li key={d.id}><a href={d.url} target="_blank" className="underline">{d.title}</a></li>
            ))}
          </ul>
        </section>
      )}
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


