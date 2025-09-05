"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <>
      {open ? (
        <button
          aria-label="Menü"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded border"
          aria-expanded="true"
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">Menü öffnen</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-black" />
            <span className="block h-0.5 w-5 bg-black" />
            <span className="block h-0.5 w-5 bg-black" />
          </div>
        </button>
      ) : (
        <button
          aria-label="Menü"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded border"
          aria-expanded="false"
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">Menü öffnen</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-black" />
            <span className="block h-0.5 w-5 bg-black" />
            <span className="block h-0.5 w-5 bg-black" />
          </div>
        </button>
      )}
      {open && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav id="mobile-menu" aria-label="Hauptmenü" className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-white p-6 shadow-soft animate-[slideIn_.2s_ease]">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">Menü</span>
              <button aria-label="Schließen" onClick={() => setOpen(false)} className="h-8 w-8 inline-flex items-center justify-center rounded border">×</button>
            </div>
            <ul className="space-y-3 text-sm">
              <li><Link href="/produkte" onClick={() => setOpen(false)}>Produkte</Link></li>
              <li><Link href="/anfrage/absenden" onClick={() => setOpen(false)}>Anfrage</Link></li>
              <li><Link href="#hilfe" onClick={() => setOpen(false)}>Hilfe</Link></li>
            </ul>
          </nav>
        </div>
      )}
      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(-20px); opacity: .5 } to { transform: translateX(0); opacity: 1 } }
      `}</style>
    </>
  );
}


