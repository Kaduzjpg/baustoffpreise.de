import { Breadcrumbs } from '../../components/Breadcrumbs';
import { ProductsBrowser } from '../../components/ProductsBrowser';
import { env } from '../../lib/env';

export default async function ProductsPage() {
  let products: any[] = [];
  let categories: any[] = [];
  try {
    const [pr, cr] = await Promise.all([
      fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/list`, { cache: 'no-store' }),
      fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' })
    ]);
    if (pr.ok) products = await pr.json();
    if (cr.ok) categories = await cr.json();
  } catch {}

  return (
    <main className="container py-8 space-y-6">
      <Breadcrumbs items={[{ href: '/', label: 'Start' }, { label: 'Produkte' }]} />
      <h1 className="text-2xl font-semibold">Produkte</h1>
      <ProductsBrowser products={products || []} categories={categories || []} />
    </main>
  );
}
 
