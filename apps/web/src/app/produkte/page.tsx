import { Breadcrumbs } from '../../components/Breadcrumbs';
import { ProductsBrowser } from '../../components/ProductsBrowser';
import { env } from '../../lib/env';

export default async function ProductsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // Zeige Daten nur, wenn die API/DB erreichbar ist
  let healthy = false;
  try {
    const h = await fetch(`${env.NEXT_PUBLIC_API_BASE}/healthz`, { cache: 'no-store' });
    healthy = h.ok;
  } catch {}

  if (!healthy) {
    return (
      <main className="container py-8 space-y-6">
        <Breadcrumbs items={[{ href: '/', label: 'Start' }, { label: 'Produkte' }]} />
        <h1 className="text-2xl font-semibold">Produkte</h1>
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-700">
          Datenbank derzeit nicht erreichbar. Bitte später erneut versuchen.
        </div>
      </main>
    );
  }
  let categories: any[] = [];
  const q = String(searchParams?.q ?? '');
  const unit = String(searchParams?.unit ?? '');
  const categoryId = String(searchParams?.categoryId ?? '');
  const brand = String(searchParams?.brand ?? '');
  const stock = String(searchParams?.stock ?? '');
  const radius = String(searchParams?.radius ?? '');
  const zip = String(searchParams?.zip ?? '');
  const page = Math.max(1, parseInt(String(searchParams?.page ?? '1'), 10) || 1);
  const pageSize = Math.min(60, Math.max(1, parseInt(String(searchParams?.pageSize ?? '12'), 10) || 12));
  let initialServer: any = null;
  try {
    const sp = new URLSearchParams({ q, unit, categoryId, brand, stock, radius, zip, page: String(page), pageSize: String(pageSize) });
    const [sr, cr] = await Promise.all([
      fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/search?${sp.toString()}`, { cache: 'no-store' }),
      fetch(`${env.NEXT_PUBLIC_API_BASE}/api/products/categories`, { cache: 'no-store' })
    ]);
    if (sr.ok) initialServer = await sr.json();
    if (cr.ok) categories = await cr.json();
  } catch {}

  return (
    <main className="container py-8 space-y-6">
      <Breadcrumbs items={[{ href: '/', label: 'Start' }, { label: 'Produkte' }]} />
      <h1 className="text-2xl font-semibold">Produkte</h1>
      <ProductsBrowser
        products={initialServer?.items || []}
        categories={categories || []}
        pageSize={pageSize}
        initialServer={initialServer}
        initialFilters={{ q, unit, categoryId, brand, stock, radius, zip, page }}
      />
    </main>
  );
}
 
