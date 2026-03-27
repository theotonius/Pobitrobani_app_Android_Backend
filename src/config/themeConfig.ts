export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  backgroundAlt: string;
  cardBg: string;
  glassBg: string;
  border: string;
}

export const defaultLightTheme: ThemeColors = {
  primary: '#a16207',
  primaryLight: '#f59e0b',
  primaryDark: '#78350f',
  accent: '#d97706',
  accentLight: '#f59e0b',
  textPrimary: '#1c1917',
  textSecondary: '#57534e',
  textMuted: '#78716c',
  background: '#fafaf9',
  backgroundAlt: '#f5f4f0',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  glassBg: 'rgba(255, 255, 255, 0.85)',
  border: 'rgba(120, 113, 108, 0.12)',
};

export const defaultDarkTheme: ThemeColors = {
  primary: '#f59e0b',
  primaryLight: '#fcd34d',
  primaryDark: '#b45309',
  accent: '#fbbf24',
  accentLight: '#fcd34d',
  textPrimary: '#e7e5e4',
  textSecondary: '#a8a29e',
  textMuted: '#78716c',
  background: '#0a0a0a',
  backgroundAlt: '#0a0a05',
  cardBg: 'rgba(25, 25, 20, 0.9)',
  glassBg: 'rgba(30, 30, 25, 0.75)',
  border: 'rgba(251, 191, 36, 0.1)',
};

export const lightThemePresets: Record<string, ThemeColors> = {
  default: defaultLightTheme,
  warm: {
    primary: '#b45309',
    primaryLight: '#f97316',
    primaryDark: '#7c2d12',
    accent: '#ea580c',
    accentLight: '#fb923c',
    textPrimary: '#1c1917',
    textSecondary: '#44403c',
    textMuted: '#57534e',
    background: '#fff7ed',
    backgroundAlt: '#ffedd5',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(234, 88, 12, 0.12)',
  },
  ocean: {
    primary: '#0369a1',
    primaryLight: '#0ea5e9',
    primaryDark: '#075985',
    accent: '#0284c7',
    accentLight: '#38bdf8',
    textPrimary: '#0c4a6e',
    textSecondary: '#155e75',
    textMuted: '#164e63',
    background: '#f0f9ff',
    backgroundAlt: '#e0f2fe',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(14, 165, 233, 0.12)',
  },
  forest: {
    primary: '#15803d',
    primaryLight: '#22c55e',
    primaryDark: '#166534',
    accent: '#16a34a',
    accentLight: '#4ade80',
    textPrimary: '#14532d',
    textSecondary: '#166534',
    textMuted: '#15803d',
    background: '#f0fdf4',
    backgroundAlt: '#dcfce7',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(34, 197, 94, 0.12)',
  },
  royal: {
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    primaryDark: '#5b21b6',
    accent: '#8b5cf6',
    accentLight: '#c4b5fd',
    textPrimary: '#1e1b4b',
    textSecondary: '#312e81',
    textMuted: '#3730a3',
    background: '#faf5ff',
    backgroundAlt: '#f3e8ff',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(139, 92, 246, 0.12)',
  },
  monochrome: {
    primary: '#404040',
    primaryLight: '#737373',
    primaryDark: '#262626',
    accent: '#525252',
    accentLight: '#a3a3a3',
    textPrimary: '#171717',
    textSecondary: '#404040',
    textMuted: '#525252',
    background: '#fafafa',
    backgroundAlt: '#f5f5f5',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(0, 0, 0, 0.08)',
  },
};

export function applyLightThemeColors(colors: ThemeColors): void {
  const root = document.documentElement;
  root.style.setProperty('--light-primary', colors.primary);
  root.style.setProperty('--light-primary-light', colors.primaryLight);
  root.style.setProperty('--light-primary-dark', colors.primaryDark);
  root.style.setProperty('--light-accent', colors.accent);
  root.style.setProperty('--light-accent-light', colors.accentLight);
  root.style.setProperty('--light-text-primary', colors.textPrimary);
  root.style.setProperty('--light-text-secondary', colors.textSecondary);
  root.style.setProperty('--light-text-muted', colors.textMuted);
  root.style.setProperty('--light-background', colors.background);
  root.style.setProperty('--light-background-alt', colors.backgroundAlt);
  root.style.setProperty('--light-card-bg', colors.cardBg);
  root.style.setProperty('--light-glass-bg', colors.glassBg);
  root.style.setProperty('--light-border', colors.border);
}

export function getThemeColorsFromStorage(): ThemeColors | null {
  try {
    const stored = localStorage.getItem('sacred_word_light_theme');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load theme colors', e);
  }
  return null;
}

export function saveThemeColorsToStorage(colors: ThemeColors): void {
  try {
    localStorage.setItem('sacred_word_light_theme', JSON.stringify(colors));
  } catch (e) {
    console.error('Failed to save theme colors', e);
  }
}
