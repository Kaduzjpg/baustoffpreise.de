export default function SuchePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Suche</h1>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-4">
          <div>
            <div className="font-medium mb-2">Kategorie</div>
            <select className="w-full rounded border px-3 py-2">
              <option>Alle</option>
              <option>Beton</option>
              <option>Ziegel</option>
            </select>
          </div>
          <div>
            <div className="font-medium mb-2">Attribute</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Frostsicher
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Außenbereich
            </label>
          </div>
        </aside>
        <section className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <a key={i} className="flex items-center gap-4 rounded border p-4 hover:shadow-sm" href={`/produkte/${i+1}`}>
              <div className="h-16 w-20 bg-gray-100" />
              <div className="flex-1">
                <div className="font-medium">Produkt {i + 1}</div>
                <div className="text-sm text-gray-500">SKU-00{i+1}</div>
              </div>
            </a>
          ))}
        </section>
      </div>
    </div>
  )
}
