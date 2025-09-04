import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-surface">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1600585154340-1e4ce9a39ddb?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/10" />
      </div>
      <div className="relative container py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Baustoffpreise vergleichen leicht gemacht</h1>
          <p className="text-slate-700 max-w-xl">Füge Produkte in den Anfragekorb und erhalte individuelle Angebote von Händlern in deiner Region.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1">Regional 🏠</span>
            <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1">Transparent 🔍</span>
            <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1">Persönlicher Service 🤝</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/produkte" className="btn-primary">Produkte ansehen</Link>
            <Link href="#so-funktionierts" className="btn-outline">So funktioniert's</Link>
          </div>
        </div>
      </div>
    </section>
  );
}


