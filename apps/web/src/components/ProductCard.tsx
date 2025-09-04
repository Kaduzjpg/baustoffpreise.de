"use client";
import { addItem, loadCart, saveCart } from '../lib/cart';
import { getToneByCategoryId, getToneBySlug } from '../lib/categoryColors';

type Props = {
  id: number;
  name: string;
  slug: string;
  unit?: string | null;
  imageUrl?: string | null;
  categoryId?: number;
  categoriesMeta?: { id: number; slug: string }[]; // optional zur Farbableitung
  categorySlug?: string; // wenn vorhanden, direkte Farbbestimmung
};

export function ProductCard({ id, name, slug, unit, imageUrl, categoryId, categoriesMeta, categorySlug }: Props) {
  const tone = categorySlug ? getToneBySlug(categorySlug) : getToneByCategoryId(categoryId, categoriesMeta);
  function addToCart() {
    const cart = loadCart();
    const next = addItem(cart, { productId: id, name, slug, unit: unit ?? undefined, quantity: 1 });
    saveCart(next);
    try {
      window.dispatchEvent(new CustomEvent('toast', { detail: { title: `${name} zum Anfragekorb hinzugefügt`, variant: 'success' } }));
    } catch {}
  }

  return (
    <a href={`/produkte/${slug}`} className="group block rounded-3xl border bg-white shadow-soft overflow-hidden transition-transform ease-smooth hover:scale-[1.01] hover:shadow-lg">
      <div
        className="aspect-[3/2] bg-cover bg-center"
        data-bg={imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'}
        style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1581093458791-9d09b8f3a8a0?q=80&w=1200&auto=format&fit=crop'})` }}
      />
      <div className="p-2.5 space-y-1">
        <div className="text-sm font-medium leading-tight">{name}</div>
        <div className="text-xs text-slate-600">{unit}</div>
        <div className="pt-1.5">
          <button
            onClick={addToCart}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs text-white bg-brand-green hover:bg-brand-green/90 shadow-soft"
          >
            <span>🛒</span>
            <span>In Anfragekorb</span>
          </button>
        </div>
      </div>
    </a>
  );
}


