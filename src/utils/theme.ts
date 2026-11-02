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

const POWER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><path d="M64 8 L120 64 L64 120 L8 64 Z" fill="%23ef4444" fill-opacity="0.2" stroke="%23ef4444" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M38 90 L34 86 L78 42 L82 34 L88 34 L94 40 L94 46 L86 50 Z" /><path d="M32 96 L26 90 L32 84 L38 90 Z" /><path d="M46 80 L38 72 L42 68 L50 76 Z" /><path d="M90 90 L94 86 L50 42 L46 34 L40 34 L34 40 L34 46 L42 50 Z" /><path d="M96 96 L102 90 L96 84 L90 90 Z" /><path d="M82 80 L90 72 L86 68 L78 76 Z" /><polygon points="64,48 72,64 64,80 56,64" fill="%23fca5a5" /></g></svg>`;

const DEFENCE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><path d="M64 12 L110 26 C110 74 86 106 64 118 C42 106 18 74 18 26 Z" fill="%2310b981" fill-opacity="0.2" stroke="%2310b981" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M64 24 L96 34 C96 68 78 92 64 102 C50 92 32 68 32 34 Z" fill="none" stroke="%23ffffff" stroke-width="3" /><path d="M64 36 L86 44 C86 64 74 80 64 88 C54 80 42 64 42 44 Z" fill="%236ee7b7" fill-opacity="0.5" /><polygon points="64,46 76,58 64,74 52,58" fill="%23ffffff" /></g></svg>`;

const TECHNIQUE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><polygon points="64,10 114,35 114,93 64,118 14,93 14,35" fill="%23eab308" fill-opacity="0.2" stroke="%23eab308" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M64 24 C72 44 82 62 100 70 C84 76 68 70 54 56 C44 46 40 34 42 26 C48 24 56 23 64 24 Z" /><path d="M40 34 L28 46 L34 52 L46 40 Z" /><path d="M64 104 C56 84 46 66 28 58 C44 52 60 58 74 72 C84 82 88 94 86 102 C80 104 72 105 64 104 Z" /><path d="M88 94 L100 82 L94 76 L82 88 Z" /><circle cx="64" cy="64" r="6" fill="%23fef08a" /></g></svg>`;

const MOBILITY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><path d="M20 70 C20 36 50 16 94 14 C98 50 82 86 44 110 C30 100 20 86 20 70 Z" fill="%2306b6d4" fill-opacity="0.2" stroke="%2306b6d4" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M36 68 C42 46 64 30 100 24 C88 42 78 54 52 64 C44 68 38 68 36 68 Z" /><path d="M32 78 C38 62 56 50 86 44 C76 60 64 72 44 80 C38 82 34 80 32 78 Z" /><path d="M32 90 C38 78 52 70 74 64 C64 76 54 86 38 92 C34 92 32 91 32 90 Z" /></g></svg>`;

const UTILITY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><polygon points="40,12 88,12 116,40 116,88 88,116 40,116 12,88 12,40" fill="%23a855f7" fill-opacity="0.2" stroke="%23a855f7" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M56 22 C56 16 72 16 72 22 L76 28 L52 28 Z" /><path d="M46 32 L82 32 L88 48 L78 86 L50 86 L40 48 Z" fill="none" stroke="%23ffffff" stroke-width="3" /><polygon points="64,42 76,58 64,74 52,58" fill="%23e9d5ff" /><circle cx="64" cy="58" r="4" fill="%23ffffff" /><path d="M46 92 L82 92 L86 102 L42 102 Z" /></g></svg>`;

export function getCellCategoryIcon(socketOrSlot?: string | null): string {
  const key = (socketOrSlot || 'prismatic').toLowerCase().trim();
  switch (key) {
    case 'alacrity':
      return '/assets/icons/perks/Alacrity.png';
    case 'brutality':
      return '/assets/icons/perks/Brutality.png';
    case 'finesse':
      return '/assets/icons/perks/Finesse.png';
    case 'fortitude':
      return '/assets/icons/perks/Fortitude.png';
    case 'insight':
      return '/assets/icons/perks/Insight.png';
    case 'power':
      return POWER_SVG;
    case 'technique':
      return TECHNIQUE_SVG;
    case 'defence':
    case 'defense':
      return DEFENCE_SVG;
    case 'mobility':
      return MOBILITY_SVG;
    case 'utility':
      return UTILITY_SVG;
    case 'prismatic':
    default:
      return '/assets/icons/perks/Prismatic.png';
  }
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

export type ThemeMode = 'dark' | 'light';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('dauntless_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
}

export function setTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dauntless_theme', theme);
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme(): ThemeMode {
  const theme = getStoredTheme();
  setTheme(theme);
  return theme;
}


