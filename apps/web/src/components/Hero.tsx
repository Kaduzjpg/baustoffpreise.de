import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-surface">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-1e4ce9a39ddb?q=80&w=1400&auto=format&fit=crop"
            alt="Baustoffe im Lager – Symbolbild für Bau und Materialien"
            fill
            sizes="100vw"
            className="object-cover opacity-70"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/85 to-white/10" />
      </div>
      <div className="relative container py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Baustoffe anfragen – Angebote von Händlern aus deiner Nähe vergleichen</h1>
          <ul className="text-slate-700 max-w-xl list-disc pl-5 space-y-1">
            <li>Kostenlos anfragen</li>
            <li>Antwort in 24–48 h</li>
            <li>Lokale Händler</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href="/produkte" className="btn-primary" aria-label="Produkte auswählen">Produkte auswählen</Link>
            <Link href="#so-funktionierts" className="btn-outline" aria-label="So funktioniert’s">So funktioniert’s</Link>
          </div>
        </div>
      </div>
    </section>
  );
}


