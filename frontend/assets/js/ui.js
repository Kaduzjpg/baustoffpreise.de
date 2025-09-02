export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed z-50 top-4 right-4 space-y-2';
    document.body.appendChild(container);
  }
  const bg = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-emerald-600' : 'bg-gray-800';
  const el = document.createElement('div');
  el.className = `${bg} text-white px-4 py-2 rounded shadow-md transition-opacity`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, 2500);
}

export function validateInquiry(payload) {
  const errors = {};
  const isEmail = /.+@.+\..+/;
  const isZip = /^\d{5}$/;
  if (!payload.customerName || payload.customerName.trim().length < 2 || payload.customerName.length > 150) errors.customerName = 'Bitte Name angeben (2–150 Zeichen).';
  if (!payload.customerEmail || !isEmail.test(payload.customerEmail)) errors.customerEmail = 'Bitte gültige E-Mail angeben.';
  if (payload.customerPhone && payload.customerPhone.length > 50) errors.customerPhone = 'Telefonnummer ist zu lang.';
  if (!payload.zip || !isZip.test(payload.zip)) errors.zip = 'PLZ muss 5-stellig sein.';
  const r = Number(payload.radius);
  if (!Number.isInteger(r) || r < 1 || r > 200) errors.radius = 'Radius 1–200 km.';
  if (!Array.isArray(payload.items) || payload.items.length < 1) errors.items = 'Mindestens 1 Produkt.';
  if (payload.note && payload.note.length > 1000) errors.note = 'Notiz ist zu lang.';
  return { valid: Object.keys(errors).length === 0, errors };
}


