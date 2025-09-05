"use client";
import { RefObject } from 'react';

type Form = {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerZip: string;
  customerStreet: string;
  customerCity: string;
};

export function ContactStep({
  form,
  fieldErrors,
  setForm,
  refs
}: {
  form: Form;
  fieldErrors: Record<string, string>;
  setForm: (f: Form | ((f: Form) => Form)) => void;
  refs: {
    nameRef: RefObject<HTMLInputElement>;
    emailRef: RefObject<HTMLInputElement>;
    phoneRef: RefObject<HTMLInputElement>;
    streetRef: RefObject<HTMLInputElement>;
    cityRef: RefObject<HTMLInputElement>;
    zipRef: RefObject<HTMLInputElement>;
  };
}) {
  const { nameRef, emailRef, phoneRef, streetRef, cityRef, zipRef } = refs;
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm mb-1">Name</label>
        {fieldErrors.customerName ? (
          <input ref={nameRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required minLength={2} maxLength={160} title="Name" placeholder="Max Mustermann" aria-invalid="true" aria-describedby="err-customerName" />
        ) : (
          <input ref={nameRef} className={`w-full border rounded px-3 py-2`} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required minLength={2} maxLength={160} title="Name" placeholder="Max Mustermann" />
        )}
        {fieldErrors.customerName && <p id="err-customerName" className="mt-1 text-xs text-red-600">{fieldErrors.customerName}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">E-Mail</label>
        {fieldErrors.customerEmail ? (
          <input ref={emailRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required type="email" title="E-Mail" placeholder="name@beispiel.de" aria-invalid="true" aria-describedby="err-customerEmail" />
        ) : (
          <input ref={emailRef} className={`w-full border rounded px-3 py-2`} value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required type="email" title="E-Mail" placeholder="name@beispiel.de" />
        )}
        {fieldErrors.customerEmail && <p id="err-customerEmail" className="mt-1 text-xs text-red-600">{fieldErrors.customerEmail}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">Telefon (optional)</label>
        {fieldErrors.customerPhone ? (
          <input ref={phoneRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} title="Telefon" placeholder="01234 567890" pattern="^\\+?[0-9 ()-]{6,}$" aria-invalid="true" aria-describedby="err-customerPhone" />
        ) : (
          <input ref={phoneRef} className={`w-full border rounded px-3 py-2`} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} title="Telefon" placeholder="01234 567890" pattern="^\\+?[0-9 ()-]{6,}$" />
        )}
        {fieldErrors.customerPhone && <p id="err-customerPhone" className="mt-1 text-xs text-red-600">{fieldErrors.customerPhone}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Straße & Nr.</label>
          {fieldErrors.customerStreet ? (
            <input ref={streetRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerStreet} onChange={(e) => setForm({ ...form, customerStreet: e.target.value })} required minLength={3} maxLength={160} title="Straße & Nr." placeholder="Musterstraße 1" aria-invalid="true" aria-describedby="err-customerStreet" />
          ) : (
            <input ref={streetRef} className={`w-full border rounded px-3 py-2`} value={form.customerStreet} onChange={(e) => setForm({ ...form, customerStreet: e.target.value })} required minLength={3} maxLength={160} title="Straße & Nr." placeholder="Musterstraße 1" />
          )}
          {fieldErrors.customerStreet && <p id="err-customerStreet" className="mt-1 text-xs text-red-600">{fieldErrors.customerStreet}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Ort</label>
          {fieldErrors.customerCity ? (
            <input ref={cityRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerCity} onChange={(e) => setForm({ ...form, customerCity: e.target.value })} required minLength={2} maxLength={120} title="Ort" placeholder="Musterstadt" aria-invalid="true" aria-describedby="err-customerCity" />
          ) : (
            <input ref={cityRef} className={`w-full border rounded px-3 py-2`} value={form.customerCity} onChange={(e) => setForm({ ...form, customerCity: e.target.value })} required minLength={2} maxLength={120} title="Ort" placeholder="Musterstadt" />
          )}
          {fieldErrors.customerCity && <p id="err-customerCity" className="mt-1 text-xs text-red-600">{fieldErrors.customerCity}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">PLZ</label>
        {fieldErrors.customerZip ? (
          <input ref={zipRef} className={`w-full border rounded px-3 py-2 border-red-600`} value={form.customerZip} onChange={(e) => setForm({ ...form, customerZip: e.target.value })} required pattern="\\d{5}" title="PLZ" placeholder="12345" aria-invalid="true" aria-describedby="err-customerZip" />
        ) : (
          <input ref={zipRef} className={`w-full border rounded px-3 py-2`} value={form.customerZip} onChange={(e) => setForm({ ...form, customerZip: e.target.value })} required pattern="\\d{5}" title="PLZ" placeholder="12345" />
        )}
        {fieldErrors.customerZip && <p id="err-customerZip" className="mt-1 text-xs text-red-600">{fieldErrors.customerZip}</p>}
      </div>
    </div>
  );
}


