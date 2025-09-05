"use client";

type Form = {
  radiusKm: number;
  message: string;
};

export function OptionsStep({ form, setForm, lookupCount, fileRef, setFiles, setFieldErrors }: {
  form: Form;
  setForm: (f: Form | ((f: Form) => Form)) => void;
  lookupCount: number | null;
  fileRef: React.RefObject<HTMLInputElement>;
  setFiles: (files: File[]) => void;
  setFieldErrors: (updater: (fe: Record<string, string>) => Record<string, string>) => void;
}) {
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm mb-1">Radius: {form.radiusKm} km</label>
        <input type="range" min={10} max={100} value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: Number(e.target.value) })} className="w-full" title="Umkreis" />
        {lookupCount != null && (
          <div className="text-xs text-slate-600">Händler im Umkreis: {lookupCount}</div>
        )}
      </div>
      <div>
        <label className="block text-sm mb-1">Nachricht (optional)</label>
        <textarea className="w-full border rounded px-3 py-2" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} title="Nachricht" placeholder="Ihre Nachricht an die Händler (optional)" />
      </div>
      <div>
        <label className="block text-sm mb-1">Anhänge (max. 8 Dateien, je ≤ 5 MB)</label>
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          ref={fileRef}
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            const filtered = selected.filter((f) => f.size <= MAX_FILE_BYTES).slice(0, 8);
            if (selected.length !== filtered.length) {
              setFieldErrors((fe) => ({ ...fe, attachments: 'Einige Dateien wurden verworfen, da sie größer als 5 MB sind.' }));
            }
            setFiles(filtered);
          }}
          title="Anhänge"
        />
      </div>
    </div>
  );
}


