import '../globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Header } from '../../components/Header';
import { ToastHost } from '../../components/ToastHost';

export const metadata: Metadata = {
  title: 'Anfrage-Shop',
  description: 'Produkte anfragen, Händler erhalten die Anfrage und antworten individuell.'
};

export default function LocaleLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  return (
    <html lang={params.locale}>
      <body className="min-h-screen bg-surface text-ink antialiased">
        <Header />
        <ToastHost />
        <main>{children}</main>
      </body>
    </html>
  );
}


