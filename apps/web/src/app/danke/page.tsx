import Link from 'next/link';
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import successAnim from './success.json';

export default function ThanksPage() {
  return (
    <main className="container py-16 text-center space-y-6">
      <div className="mx-auto h-28 w-28">
        <Lottie animationData={successAnim as any} loop={false} />
      </div>
      <h1 className="text-3xl font-semibold">Vielen Dank!</h1>
      <p className="text-slate-700">Ihre Anfrage wurde versendet. Händler melden sich per E-Mail.</p>
      <div>
        <Link className="inline-flex items-center px-5 py-2.5 rounded bg-anthracite text-white hover:scale-[1.02] hover:shadow-soft transition-transform ease-smooth" href="/">Zur Startseite</Link>
      </div>
      <style jsx global>{`@keyframes pop { from { transform: scale(.9); opacity:.7 } to { transform: scale(1); opacity:1 } }`}</style>
    </main>
  );
}


