export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'gap_cockpit_theme_v1';

export function loadThemePreference(): ThemeMode {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveThemePreference(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme remains usable when browser storage is unavailable.
  }
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme;
}
