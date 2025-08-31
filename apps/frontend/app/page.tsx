export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Schnell suchen nach Produkt, SKU, Kategorie..."
          className="w-full rounded border px-4 py-3 outline-none focus:ring-2 focus:ring-brand/40"
        />
        <a href="/suche" className="rounded bg-brand text-white px-4 py-3">Suche</a>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">Kategorien</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {["Beton", "Ziegel", "Dämmung", "Holz"].map((k) => (
            <a key={k} href={`/kategorien/${encodeURIComponent(k.toLowerCase())}`} className="rounded border p-4 hover:shadow-sm">
              {k}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
