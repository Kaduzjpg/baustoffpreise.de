import Link from 'next/link';
import { env } from '../../lib/env';

type Category = { id: number; name: string; slug: string };

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
    <main className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kategorien</h1>
        <Link href="/" className="text-sm underline">Zur Startseite</Link>
      </div>
      <p className="text-sm text-slate-600">Wähle eine Kategorie – wir zeigen dir passende Produkte.</p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {data.map((c) => (
          <li key={c.id}>
            <Link href={`/categories/${c.slug}`} className="inline-flex w-full items-center justify-center rounded-full border px-4 py-2 text-sm hover:bg-slate-50">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}



