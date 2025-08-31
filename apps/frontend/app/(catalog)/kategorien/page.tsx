export default function KategorienPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Kategorien</h1>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {['Beton', 'Ziegel', 'Dämmung', 'Holz', 'Putz', 'Mörtel'].map((k) => (
          <li key={k}>
            <a className="block rounded border p-4 hover:shadow-sm" href={`/kategorien/${k.toLowerCase()}`}>{k}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
