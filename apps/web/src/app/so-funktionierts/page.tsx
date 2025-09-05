export default function SoFunktioniertsPage() {
  const faqs = [
    { q: 'Wie lange dauert es bis zur Antwort?', a: 'In der Regel 24–48 Stunden, abhängig von Produkt und Region.' },
    { q: 'Kostet die Anfrage etwas?', a: 'Nein, die Anfrage ist kostenlos und unverbindlich.' },
    { q: 'Wie viele Händler erhalten meine Anfrage?', a: 'Nur passende Händler in deiner Region.' }
  ];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
  return (
    <main className="container py-10 space-y-8">
      <h1 className="text-2xl font-semibold">So funktioniert’s</h1>
      <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <li className="rounded-2xl border bg-white p-4 shadow-soft"><div className="font-medium mb-1">1. Produkte auswählen</div><p>Produkte in den Anfragekorb legen.</p></li>
        <li className="rounded-2xl border bg-white p-4 shadow-soft"><div className="font-medium mb-1">2. Kontaktdaten angeben</div><p>Kontaktdaten und Optionen eintragen.</p></li>
        <li className="rounded-2xl border bg-white p-4 shadow-soft"><div className="font-medium mb-1">3. Händler erhalten E‑Mail</div><p>Passende Händler bekommen deine Anfrage.</p></li>
        <li className="rounded-2xl border bg-white p-4 shadow-soft"><div className="font-medium mb-1">4. Angebote vergleichen</div><p>Angebote prüfen und entscheiden.</p></li>
      </ol>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">FAQ</h2>
        {faqs.map((f, i) => (
          <details key={i} className="rounded-2xl border bg-white p-4 shadow-soft">
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="mt-2 text-slate-700">{f.a}</p>
          </details>
        ))}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}


