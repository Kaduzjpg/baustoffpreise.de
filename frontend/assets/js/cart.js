const STORAGE_KEY = 'inquiryCart';

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function writeCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function getCart() {
  return readCart();
}

export function clearCart() {
  writeCart({ items: [] });
}

export function addItem(productId, quantity = 1, note = '') {
  const cart = readCart();
  const idx = cart.items.findIndex((i) => i.productId === productId);
  if (idx >= 0) {
    cart.items[idx].quantity += quantity;
    if (note) cart.items[idx].note = note;
  } else {
    cart.items.push({ productId, quantity, note });
  }
  writeCart(cart);
  return cart;
}

export function updateItem(productId, quantity, note) {
  const cart = readCart();
  const idx = cart.items.findIndex((i) => i.productId === productId);
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
      cart.items[idx].note = note ?? cart.items[idx].note ?? '';
    }
    writeCart(cart);
  }
  return cart;
}

export function removeItem(productId) {
  const cart = readCart();
  const next = { items: cart.items.filter((i) => i.productId !== productId) };
  writeCart(next);
  return next;
}


