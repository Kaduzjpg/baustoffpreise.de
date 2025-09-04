import Link from 'next/link';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function CategoryPill({ href, children, className }: Props) {
  return (
    <Link
      href={href}
      className={
        `inline-flex items-center justify-start rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm md:text-base shadow-sm transition hover:bg-[#E8F5E9] hover:shadow-md ${className || ''}`
      }
    >
      {children}
    </Link>
  );
}


