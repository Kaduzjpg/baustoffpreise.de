export type FavoritesState = { ids: number[] };

const STORAGE_KEY = 'favorites_v1';

export function loadFavorites(): FavoritesState {
  if (typeof window === 'undefined') return { ids: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ids: [] };
    const parsed = JSON.parse(raw) as FavoritesState;
    return { ids: Array.isArray(parsed.ids) ? parsed.ids : [] };
  } catch {
    return { ids: [] };
  }
}

export function saveFavorites(state: FavoritesState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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


