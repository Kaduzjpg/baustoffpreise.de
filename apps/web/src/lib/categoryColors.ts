export type CategoryTone = { base: string; light: string };

const slugToBase: Record<string, string> = {
  'rohbau': '#c0392b',
  'dach-fassade': '#8e44ad',
  'innenausbau': '#27ae60',
  'boden-fliessen': '#2980b9',
  'garten-landschaft': '#16a085',
  'holz-tueren': '#d35400',
  'fenster-sonnenschutz': '#2c3e50',
  'sanitaer-heizung': '#e67e22',
  'werkzeuge-baugeraete': '#7f8c8d'
};

function lighten(hex: string, amount = 0.65): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const to = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${to(r).toString(16).padStart(2, '0')}${to(g).toString(16).padStart(2, '0')}${to(b).toString(16).padStart(2, '0')}`;
}

export function getToneBySlug(slug?: string): CategoryTone | undefined {
  if (!slug) return undefined;
  const base = slugToBase[slug];
  if (!base) return undefined;
  return { base, light: lighten(base) };
}

export function getToneByCategoryId(categoryId?: number, categories?: { id: number; slug: string }[]): CategoryTone | undefined {
  if (!categoryId || !categories) return undefined;
  const found = categories.find((c) => c.id === categoryId);
  return getToneBySlug(found?.slug);
}






