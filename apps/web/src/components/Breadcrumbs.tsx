import Link from 'next/link';

type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((c, i) => (
          <li key={i} className="inline-flex items-center gap-2">
            {i > 0 && <span className="opacity-60">/</span>}
            {c.href ? <Link href={c.href} className="hover:underline">{c.label}</Link> : <span className="text-slate-900">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}









