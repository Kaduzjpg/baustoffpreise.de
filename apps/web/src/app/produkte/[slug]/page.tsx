import Link from 'next/link';
import { env } from '../../../lib/env';

type Product = { id: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null; description?: string | null };

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
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold leading-tight">{product.name}</h1>
          {product.unit && <div className="text-sm text-slate-600">Einheit: {product.unit}</div>}
          {product.description && <p className="text-slate-700 whitespace-pre-line">{product.description}</p>}
          <div>
            <Link href={`/anfragekorb?add=${product.slug}`} className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/90">In Anfragekorb</Link>
          </div>
        </div>
      </div>
    </main>
  );
}


