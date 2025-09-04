// Add breadcrumb at top of product list page
import { env } from '../../lib/env';
import { ProductsBrowser, Product } from '../../components/ProductsBrowser';

type Category = { id: number; name: string; slug: string };

export default async function ProductsPage() {
  const [pRes, cRes] = await Promise.all([
    fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/list`, { cache: 'no-store' }),
    fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' })
  ]);
  const products = (await pRes.json()) as Product[];
  const categories = (await cRes.json()) as Category[];
  return (
    <main className="container py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Alle Produkte</h1>
      <ProductsBrowser products={products} categories={categories} />
    </main>
  );
}






