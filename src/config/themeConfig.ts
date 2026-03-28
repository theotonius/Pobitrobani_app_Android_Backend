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
  primary: '#92400e',
  primaryLight: '#d97706',
  primaryDark: '#78350f',
  accent: '#b45309',
  accentLight: '#f59e0b',
  textPrimary: '#1c1917',
  textSecondary: '#44403c',
  textMuted: '#78716c',
  background: '#fdfcfb',
  backgroundAlt: '#f8f6f3',
  cardBg: 'rgba(255, 255, 255, 0.98)',
  glassBg: 'rgba(255, 255, 255, 0.92)',
  border: 'rgba(180, 160, 130, 0.15)',
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
    primaryLight: '#ea580c',
    primaryDark: '#7c2d12',
    accent: '#c2410c',
    accentLight: '#fb923c',
    textPrimary: '#1c1917',
    textSecondary: '#44403c',
    textMuted: '#78716c',
    background: '#fffbf5',
    backgroundAlt: '#fef3e2',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    glassBg: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(234, 88, 12, 0.15)',
  },
  ocean: {
    primary: '#0369a1',
    primaryLight: '#0ea5e9',
    primaryDark: '#075985',
    accent: '#0284c7',
    accentLight: '#38bdf8',
    textPrimary: '#0c4a6e',
    textSecondary: '#155e75',
    textMuted: '#64748b',
    background: '#f8fcff',
    backgroundAlt: '#e8f4fc',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    glassBg: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(14, 165, 233, 0.15)',
  },
  forest: {
    primary: '#15803d',
    primaryLight: '#22c55e',
    primaryDark: '#166534',
    accent: '#16a34a',
    accentLight: '#4ade80',
    textPrimary: '#14532d',
    textSecondary: '#166534',
    textMuted: '#64748b',
    background: '#f8fff8',
    backgroundAlt: '#e8fce8',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    glassBg: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(34, 197, 94, 0.15)',
  },
  royal: {
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    primaryDark: '#5b21b6',
    accent: '#8b5cf6',
    accentLight: '#c4b5fd',
    textPrimary: '#1e1b4b',
    textSecondary: '#3730a3',
    textMuted: '#64748b',
    background: '#fcf8ff',
    backgroundAlt: '#f5f0ff',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    glassBg: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(139, 92, 246, 0.15)',
  },
  monochrome: {
    primary: '#374151',
    primaryLight: '#6b7280',
    primaryDark: '#1f2937',
    accent: '#4b5563',
    accentLight: '#9ca3af',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    background: '#fafbfc',
    backgroundAlt: '#f3f4f6',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    glassBg: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(107, 114, 128, 0.12)',
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
