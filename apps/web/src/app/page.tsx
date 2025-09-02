import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container py-10 space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-semibold">Anfrage-Shop für Baustoffe</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Füge Produkte in deinen Anfragekorb und sende eine Anfrage an Händler in deiner Region. Du erhältst
          individuelle Angebote per E-Mail.
        </p>
        <div>
          <Link className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2" href="/kategorien">
            Kategorien ansehen
          </Link>
        </div>
      </section>
    </main>
  );
}


