"use client";
import { useMemo, useState } from 'react';

type Variant = { id: number; productId: number; format?: string | null; variant?: string | null; unit?: string | null; sku?: string | null; imageUrl?: string | null };
type Spec = { id: number; productId: number; variantId?: number | null; format?: string | null; variant?: string | null; specKey: string; specValue: string };

export function ProductDetailClient({
  baseImage,
  unit,
  variants,
  specs
}: {
  baseImage?: string | null;
  unit?: string | null;
  variants: Variant[];
  specs: Spec[];
}) {
  const formats = useMemo(() => Array.from(new Set((variants || []).map(v => (v.format || '').trim()).filter(Boolean))), [variants]);
  const [format, setFormat] = useState<string | undefined>(formats[0]);
  const variantsForFormat = useMemo(() => (variants || []).filter(v => (v.format || '') === (format || '')), [variants, format]);
  const variantNames = useMemo(() => Array.from(new Set(variantsForFormat.map(v => (v.variant || '').trim()).filter(Boolean))), [variantsForFormat]);
  const [variant, setVariant] = useState<string | undefined>(variantNames[0]);
  const active = useMemo(() => variantsForFormat.find(v => (v.variant || '') === (variant || '')) || variantsForFormat[0] || variants[0], [variantsForFormat, variant, variants]);
  const currentUnit = active?.unit || unit || undefined;
  const image = active?.imageUrl || baseImage || undefined;

  const filteredSpecs = useMemo(() => {
    const f = (specs || []).filter(s => {
      if (format && s.format && s.format !== format) return false;
      if (variant && s.variant && s.variant !== variant) return false;
      return true;
    });
    return f.length ? f : specs;
  }, [specs, format, variant]);

  const [qty, setQty] = useState<number>(1);

  return (
    <div className="space-y-4">
      {formats.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Format</div>
          <div className="flex flex-wrap gap-2">
            {formats.map(f => (
              <button key={f} onClick={() => setFormat(f)} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${format === f ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>{f}</button>
            ))}
          </div>
        </div>
      )}
      {variantNames.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Variante</div>
          <div className="flex flex-wrap gap-2">
            {variantNames.map(v => (
              <button key={v} onClick={() => setVariant(v)} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${variant === v ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>{v}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 pt-2">
        <div>
          <div className="text-sm text-slate-600">Menge</div>
          <input type="number" value={qty} min={1} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} className="w-24 border rounded px-3 py-2" />
        </div>
        <div className="pb-2 text-sm text-slate-900">{currentUnit || 'Stück'}</div>
      </div>

      {Array.isArray(filteredSpecs) && filteredSpecs.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-1">Technische Daten</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {filteredSpecs.slice(0, 16).map(s => (
              <li key={s.id} className="flex justify-between"><span className="text-slate-600">{s.specKey}</span><span className="font-medium">{s.specValue}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}





