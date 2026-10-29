export const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Blaze: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/40', glow: 'shadow-orange-500/20' },
  Frost: { bg: 'bg-cyan-950/40', text: 'text-cyan-300', border: 'border-cyan-400/40', glow: 'shadow-cyan-400/20' },
  Shock: { bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-400/40', glow: 'shadow-yellow-400/20' },
  Terra: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-400/40', glow: 'shadow-emerald-400/20' },
  Radiant: { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-300/40', glow: 'shadow-amber-300/20' },
  Umbral: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-400/40', glow: 'shadow-purple-400/20' },
  Neutral: { bg: 'bg-slate-900/60', text: 'text-slate-300', border: 'border-slate-500/40', glow: 'shadow-slate-500/10' },
};

export const CELL_SOCKET_COLORS: Record<string, { bg: string; text: string; border: string; pill: string }> = {
  brutality: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/40', pill: 'bg-red-600' },
  finesse: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/40', pill: 'bg-blue-600' },
  fortitude: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40', pill: 'bg-emerald-600' },
  alacrity: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40', pill: 'bg-amber-600' },
  insight: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/40', pill: 'bg-purple-600' },
  prismatic: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/40', pill: 'bg-pink-600' },
  power: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/40', pill: 'bg-red-600' },
  technique: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/40', pill: 'bg-yellow-600' },
  defense: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/40', pill: 'bg-green-600' },
  defence: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/40', pill: 'bg-green-600' },
  mobility: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/40', pill: 'bg-blue-600' },
  utility: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/40', pill: 'bg-purple-600' },
};

export function getElementStyle(element: string) {
  return ELEMENT_COLORS[element] || ELEMENT_COLORS.Neutral;
}

export function getSocketStyle(socket: string) {
  const key = (socket || 'prismatic').toLowerCase();
  return CELL_SOCKET_COLORS[key] || CELL_SOCKET_COLORS.prismatic;
}

export function resolveAssetUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const clean = url.startsWith('/') ? url.slice(1) : url;
  const base = import.meta.env.BASE_URL || './';
  return `${base}${clean}`;
}

