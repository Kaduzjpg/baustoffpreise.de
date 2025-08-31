export default function AnfragekorbPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Anfragekorb</h1>
      <p className="text-gray-600">Produkte, die du an Händler anfragen möchtest.</p>
      <div className="rounded border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Produkt 1</div>
            <div className="text-sm text-gray-500">SKU-001</div>
          </div>
          <input type="number" defaultValue={5} min={1} className="w-20 rounded border px-2 py-1" />
        </div>
      </div>
      <a href="/checkout" className="inline-block rounded bg-brand text-white px-4 py-3">Zur Anfrage</a>
    </div>
  )
}
