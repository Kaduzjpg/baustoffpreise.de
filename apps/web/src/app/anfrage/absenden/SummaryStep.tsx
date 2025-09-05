"use client";

export function SummaryStep({
  form,
  files,
  itemsCount,
  consentChecked,
  setConsent
}: {
  form: { customerName: string; customerEmail: string; customerPhone?: string; customerStreet: string; customerZip: string; customerCity: string; radiusKm: number; message?: string };
  files: File[];
  itemsCount: number;
  consentChecked: boolean;
  setConsent: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="font-medium">Zusammenfassung</div>
      <ul className="space-y-1">
        <li><strong>Name:</strong> {form.customerName}</li>
        <li><strong>E-Mail:</strong> {form.customerEmail}</li>
        {form.customerPhone && <li><strong>Telefon:</strong> {form.customerPhone}</li>}
        <li><strong>Adresse:</strong> {form.customerStreet}, {form.customerZip} {form.customerCity}</li>
        <li><strong>Radius:</strong> {form.radiusKm} km</li>
        {form.message && <li><strong>Nachricht:</strong> {form.message}</li>}
        <li><strong>Dateien:</strong> {files.length} ausgewählt</li>
        <li><strong>Positionen:</strong> {itemsCount}</li>
      </ul>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={consentChecked} onChange={(e) => setConsent(e.target.checked)} title="Zustimmung" />
        <span>
          Ich stimme den <a href="/agb" className="underline">AGB</a> und der <a href="/datenschutz" className="underline">Datenschutzerklärung</a> zu.
        </span>
      </label>
    </div>
  );
}


