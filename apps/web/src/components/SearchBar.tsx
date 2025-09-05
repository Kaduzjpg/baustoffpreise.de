"use client";
import { useState } from 'react';

export function SearchBar() {
  const [q, setQ] = useState('');
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: später echte Suche/Route
    window.dispatchEvent(new CustomEvent('toast', { detail: { title: `Suche: ${q || '–'}` } }));
  }
  return (
    <form onSubmit={onSubmit} className="hidden md:flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 w-full max-w-md">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Produkte oder SKU suchen…" className="w-full bg-transparent outline-none text-sm" />
      <button className="btn-outline h-8 px-3 text-xs">Suchen</button>
    </form>
  );
}









