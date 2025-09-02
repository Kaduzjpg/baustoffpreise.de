export type CartItem = {
  productId: number;
  name: string;
  unit?: string | null;
  quantity: number;
  note?: string;
  slug: string;
};

export type CartState = {
  items: CartItem[];
};

const STORAGE_KEY = 'inquiry_cart_v1';

export function loadCart(): CartState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    return { items: parsed.items || [] };
  } catch {
    return { items: [] };
  }
}

export function saveCart(state: CartState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addItem(state: CartState, item: CartItem): CartState {
  const existing = state.items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
    return { items: [...state.items] };
  }
  return { items: [...state.items, item] };
}

export function updateItem(
  state: CartState,
  productId: number,
  updates: Partial<Pick<CartItem, 'quantity' | 'note'>>
): CartState {
  return {
    items: state.items.map((i) => (i.productId === productId ? { ...i, ...updates } : i))
  };
}

export function removeItem(state: CartState, productId: number): CartState {
  return { items: state.items.filter((i) => i.productId !== productId) };
}

export function clearCart(): CartState {
  return { items: [] };
}


