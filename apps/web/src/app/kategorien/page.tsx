import Link from 'next/link';
import { env } from '../../lib/env';

type Category = { id: number; name: string; slug: string; description?: string | null };

export default async function CategoriesPage() {
  let data: Category[] = [];
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    data = (await res.json()) as Category[];
  } catch (e) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-semibold mb-2">Kategorien</h1>
        <p className="text-sm text-slate-600">Zurzeit sind keine Kategorien verfügbar. Bitte später erneut versuchen.</p>
      </main>
    );
  }

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


