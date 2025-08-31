export default function CheckoutPage() {
  return (
    <form className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Anfrage absenden</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">E-Mail</label>
          <input name="email" type="email" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefon</label>
          <input name="phone" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">PLZ</label>
          <input name="zip" pattern="\\d{5}" required className="w-full rounded border px-3 py-2" />
        </div>
      </div>
      <button className="rounded bg-brand text-white px-4 py-3">Anfrage senden</button>
      <p className="text-sm text-gray-500">Wir suchen passende Händler in deiner Nähe und melden uns per E-Mail.</p>
    </form>
  )
}
