interface Props {
  params: { id: string }
}

export default function ProduktDetailPage({ params }: Props) {
  const { id } = params
  return (
    <article className="grid gap-6 md:grid-cols-2">
      <div className="aspect-[4/3] bg-gray-100" />
      <div>
        <nav className="text-sm text-gray-500 mb-2">Start / Produkte / {id}</nav>
        <h1 className="text-2xl font-semibold">Produkt {id}</h1>
        <p className="text-gray-600 mt-2">Kurzbeschreibung folgt...</p>
        <form action="/anfrage" className="mt-6">
          <button className="rounded bg-brand text-white px-4 py-3">Zum Anfragekorb hinzufügen</button>
        </form>
      </div>
    </article>
  )
}
