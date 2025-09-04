import Link from 'next/link';

type Props = {
  href: string;
  title: string;
  imageUrl?: string | null;
};

export function CategoryCard({ href, title, imageUrl }: Props) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-3xl border bg-white shadow-soft transition-transform ease-smooth hover:scale-[1.01] hover:shadow-lg">
      <div className="aspect-[4/3]">
        <div className="absolute inset-0 bg-gradient-to-t from-anthracite/60 to-transparent opacity-70 transition-opacity group-hover:opacity-80" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          data-bg={imageUrl || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop'}
          style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop'})` }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-white text-lg font-semibold drop-shadow">{title}</h3>
      </div>
    </Link>
  );
}


