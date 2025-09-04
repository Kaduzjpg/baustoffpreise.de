import { env } from '../../../lib/env';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { ProductCard } from '../../../components/ProductCard';

type Product = { id: number; categoryId: number; name: string; slug: string; unit?: string | null; imageUrl?: string | null };

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/by-category/${params.slug}`, { cache: 'no-store' });
  const products = (await res.json()) as Product[];
  const subRes = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/subcategories/${params.slug}`, { cache: 'no-store' });
  const subs = (await subRes.json()) as { id: number; name: string; slug: string }[];

  return (
    <main className="container py-8">
      <Breadcrumbs items={[{ href: '/', label: 'Start' }, { href: '/categories', label: 'Kategorien' }, { label: params.slug }]} />
      <h1 className="text-2xl font-semibold mb-6">Produkte</h1>
      {subs?.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-slate-600 mb-2">Unterkategorien</div>
          <ul className="flex flex-wrap gap-2">
            {subs.map((s) => (
              <li key={s.id}><span className="inline-flex items-center rounded border px-3 py-1 text-sm">{s.name}</span></li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} unit={p.unit} imageUrl={p.imageUrl || undefined} categoryId={p.categoryId} categorySlug={params.slug} />
        ))}
      </div>
    </main>
  );
}






