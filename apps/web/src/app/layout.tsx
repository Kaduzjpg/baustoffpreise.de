import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Header } from '../components/Header';
import { ToastHost } from '../components/ToastHost';

export const metadata: Metadata = {
  title: 'Anfrage-Shop',
  description: 'Produkte anfragen, Händler erhalten die Anfrage und antworten individuell.'
};

// Header wurde in eine Client-Komponente ausgelagert

function Footer() {
  return (
    <footer className="mt-16 bg-footer text-white">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-semibold mb-3">Quicklinks</div>
          <ul className="space-y-2 text-white/80">
            <li><Link href="/kategorien" className="hover:underline">Kategorien</Link></li>
            <li><Link href="/anfragekorb" className="hover:underline">Anfragekorb</Link></li>
            <li><Link href="#hilfe" className="hover:underline">Hilfe</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Kontakt</div>
          <ul className="space-y-2 text-white/80">
            <li className="text-white">E-Mail: <a href="mailto:angebot@deinedomain.de" className="underline">angebot@deinedomain.de</a></li>
            <li className="text-white">Telefon: <a href="tel:01234567890" className="underline">01234 / 567890</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Rechtliches</div>
          <ul className="space-y-2 text-white/80">
            <li><Link href="#" className="hover:underline">Impressum</Link></li>
            <li><Link href="#" className="hover:underline">Datenschutz</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-4 text-xs text-white/70">© {new Date().getFullYear()} Anfrage-Shop</div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-surface text-ink antialiased">
        <Header />
        <ToastHost />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}


