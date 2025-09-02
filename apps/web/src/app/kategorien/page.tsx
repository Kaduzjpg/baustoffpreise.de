import Link from 'next/link';
import { env } from '../../lib/env';

type Category = { id: number; name: string; slug: string; description?: string | null };

export default async function CategoriesPage() {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' });
  const data = (await res.json()) as Category[];

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Kategorien</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((c) => (
          <Link key={c.id} href={`/kategorien/${c.slug}`} className="block border rounded p-4 hover:shadow-sm focus-visible:outline focus-visible:outline-2">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-slate-600 line-clamp-2">{c.description}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}


