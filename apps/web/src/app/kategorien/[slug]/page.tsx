import Link from 'next/link';
import { env } from '../../../lib/env';

type Product = { id: number; categoryId: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null; description?: string | null };

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/by-category/${params.slug}`, { cache: 'no-store' });
  const products = (await res.json()) as Product[];

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
        <Link href="/">Start</Link>
        <span>/</span>
        <Link href="/kategorien">Kategorien</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{params.slug}</span>
      </div>
      <h1 className="text-2xl font-semibold mb-6">Produkte</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link key={p.id} href={`/produkt/${p.slug}`} className="block border rounded p-4 hover:shadow-sm focus-visible:outline focus-visible:outline-2">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-slate-600">{p.unit}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}


