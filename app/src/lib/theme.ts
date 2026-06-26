export function rgba(hex: string | undefined | null, alpha: number = 1): string {
  if (!hex || typeof hex !== 'string') return 'rgba(0, 0, 0, 0)';
  const cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length < 6) return 'rgba(0, 0, 0, 0)';
  const r = parseInt(cleaned.slice(0, 2), 16) || 0;
  const g = parseInt(cleaned.slice(2, 4), 16) || 0;
  const b = parseInt(cleaned.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface ThemeColors {
  structure: string;
  structureDark: string;
  structureLight: string;
  action: string;
  actionBright: string;
  decorative: string;
  background: string;
  surface: string;
  textPrimary: string;
  textOnCream: string;
  textOnWhite: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  structureRgba: string;
  actionRgba: string;
  decorativeRgba: string;
  backgroundRgba: string;
  surfaceRgba: string;
}

export function getThemeColors(): ThemeColors {
  const structure = getCssVar('--color-structure') || '#3d2b1f';
  const structureDark = getCssVar('--color-structure-dark') || '#2b1d14';
  const structureLight = getCssVar('--color-structure-light') || '#4a3528';
  const action = getCssVar('--color-action') || '#c9a96e';
  const actionBright = getCssVar('--color-action-bright') || '#d8b97a';
  const decorative = getCssVar('--color-decorative') || '#bfc2c8';
  const background = getCssVar('--color-background') || '#f8f5f0';
  const surface = getCssVar('--color-surface') || '#ffffff';
  const textPrimary = getCssVar('--color-text-primary') || '#f5f0e8';
  const textOnCream = getCssVar('--color-text-on-cream') || '#3d2b1f';
  const textOnWhite = getCssVar('--color-text-on-white') || '#3d2b1f';
  const textSecondary = getCssVar('--color-text-secondary') || '#a8a095';
  const textMuted = getCssVar('--color-text-muted') || '#8a8276';
  const border = getCssVar('--color-border') || '#e8e2d9';

  return {
    structure,
    structureDark,
    structureLight,
    action,
    actionBright,
    decorative,
    background,
    surface,
    textPrimary,
    textOnCream,
    textOnWhite,
    textSecondary,
    textMuted,
    border,
    structureRgba: rgba(structure, 1),
    actionRgba: rgba(action, 1),
    decorativeRgba: rgba(decorative, 1),
    backgroundRgba: rgba(background, 1),
    surfaceRgba: rgba(surface, 1),
  };
}

export function rgbaTheme(key: keyof ThemeColors, alpha: number = 1): string {
  const colors = getThemeColors();
  const raw = colors[key];
  if (!raw) return 'transparent';
  return rgba(raw, alpha);
}
