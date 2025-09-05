"use client";

export function StepHeader({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-4 text-sm" aria-label="Fortschritt">
      <li className="inline-flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">1</span> Produkte</li>
      <li className={`inline-flex items-center gap-2 ${step === 1 ? '' : 'opacity-80'}`}><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">2</span> Kontaktdaten</li>
      <li className={`inline-flex items-center gap-2 ${step === 2 ? '' : 'opacity-80'}`}><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">3</span> Optionen</li>
      <li className={`inline-flex items-center gap-2 ${step === 3 ? '' : 'opacity-80'}`}><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white text-xs">4</span> Prüfen & Absenden</li>
    </ol>
  );
}


