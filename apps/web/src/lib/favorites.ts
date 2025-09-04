export type FavoritesState = { ids: number[]; expiresAt?: number };

const STORAGE_KEY = 'favorites_v1';
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 Tage

export function loadFavorites(): FavoritesState {
  if (typeof window === 'undefined') return { ids: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ids: [] };
    const parsed = JSON.parse(raw) as FavoritesState;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return { ids: [] };
    }
    return { ids: Array.isArray(parsed.ids) ? parsed.ids : [], expiresAt: parsed.expiresAt };
  } catch {
    return { ids: [] };
  }
}

export function saveFavorites(state: FavoritesState) {
  if (typeof window === 'undefined') return;
  const withTtl: FavoritesState = { ids: state.ids, expiresAt: Date.now() + TTL_MS };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(withTtl));
  try {
    const ev = new CustomEvent('favorites:updated', { detail: { count: state.ids.length } });
    window.dispatchEvent(ev);
  } catch {}
}

export function toggleFavorite(state: FavoritesState, id: number): FavoritesState {
  const set = new Set(state.ids);
  if (set.has(id)) set.delete(id); else set.add(id);
  return { ids: Array.from(set) };
}

export function isFavorite(state: FavoritesState, id: number): boolean {
  return state.ids.includes(id);
}


