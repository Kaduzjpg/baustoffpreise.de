import Link from 'next/link';

export default function ThanksPage() {
  return (
    <main className="container py-12 text-center space-y-4">
      <h1 className="text-3xl font-semibold">Vielen Dank!</h1>
      <p className="text-slate-700">Ihre Anfrage wurde versendet. Händler melden sich per E-Mail.</p>
      <div>
        <Link className="underline" href="/">Zur Startseite</Link>
      </div>
    </main>
  );
}


