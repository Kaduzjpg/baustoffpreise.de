import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Baustoffpreise vergleichen',
    template: '%s | Baustoffpreise vergleichen',
  },
  description: 'Finde Baustoffe, filtere nach Kategorien und stelle eine Anfrage an Händler in deiner Nähe.',
  alternates: { languages: { de: '/' } },
  openGraph: {
    title: 'Baustoffpreise vergleichen',
    description: 'Schnelle Suche, facettierte Filter und Anfragekorb.',
    locale: 'de_DE',
    siteName: 'Baustoffpreise vergleichen',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-30 h-[var(--header-height)] border-b bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 flex h-full items-center justify-between">
            <a href="/" className="font-semibold">Baustoffpreise vergleichen</a>
            <a href="/anfrage" className="rounded bg-brand text-white px-3 py-1 text-sm">Anfragekorb</a>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>
        <div className="fixed bottom-4 right-4 z-40">
          <a href="/anfrage" className="shadow-lg rounded-full bg-brand text-white px-4 py-3">Anfragekorb</a>
        </div>
      </body>
    </html>
  )
}
