import Link from 'next/link';
import { env } from '../../../lib/env';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { ProductCard } from '../../../components/ProductCard';

type Product = { id: number; categoryId: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null; description?: string | null };

export default async function CategoryDetailPage({ params, searchParams }: { params: { slug: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
  let products: Product[] = [];
  let subs: { id: number; name: string; slug: string }[] = [];
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/by-category/${params.slug}`, { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      products = Array.isArray(j) ? j : [];
    }
  } catch {}
  try {
    const sres = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/subcategories/${params.slug}`, { cache: 'no-store' });
    if (sres.ok) {
      const sj = await sres.json();
      subs = Array.isArray(sj) ? sj : [];
    }
  } catch {}

  const selected = typeof searchParams?.sub === 'string' ? (searchParams?.sub as string) : Array.isArray(searchParams?.sub) ? (searchParams?.sub?.[0] as string) : undefined;

  // Einfaches serverseitiges Filtern nach Schlagwörtern/Name/Slug, falls vorhanden
  const normalized = selected?.toLowerCase();
  const filtered = normalized
    ? (products || []).filter((p) => {
        const hay = `${p.name || ''} ${p.slug || ''} ${(p as any).keywords || ''} ${(p as any).description || ''}`.toLowerCase();
        return hay.includes(normalized);
      })
    : products;

  return (
    <main className="container py-8">
      <Breadcrumbs items={[{ href: '/', label: 'Start' }, { href: '/kategorien', label: 'Kategorien' }, { label: params.slug }]} />
      <h1 className="text-2xl font-semibold mb-6">Produkte</h1>
      {subs?.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-slate-600 mb-2">Unterkategorien</div>
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href={`/kategorien/${params.slug}`} className={`inline-flex items-center rounded border px-3 py-1 text-sm ${!selected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>Alle</Link>
            </li>
            {subs.map((s) => (
              <li key={s.id}>
                <Link href={`/kategorien/${params.slug}?sub=${s.slug}`} className={`inline-flex items-center rounded border px-3 py-1 text-sm ${selected === s.slug ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Array.isArray(filtered) ? filtered : []).map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} unit={p.unit} imageUrl={p.imageUrl || undefined} categoryId={p.categoryId} categorySlug={params.slug} />
        ))}
      </div>
    </main>
  );
}


