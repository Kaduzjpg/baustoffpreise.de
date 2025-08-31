interface Props {
  params: { slug: string }
}

export default function KategorieDetailPage({ params }: Props) {
  const { slug } = params
  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">Start / Kategorien / {slug}</nav>
      <h1 className="text-2xl font-semibold capitalize">{slug}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <a key={i} href={`/produkte/${i+1}`} className="rounded border p-4 hover:shadow-sm">
            <div className="aspect-[4/3] bg-gray-100 mb-2" />
            <div className="font-medium">Produkt {i + 1}</div>
            <div className="text-sm text-gray-500">SKU-00{i+1}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
