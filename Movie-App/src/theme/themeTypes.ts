// theme/themeTypes.ts
export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  secondaryText: string;
  card: string;
  border: string;
  accent: string;
  error: string;
  success: string;
}

export const DARK_THEME: ThemeColors = {
  primary: '#FF5524',
  background: '#000000',
  text: '#FFFFFF',
  secondaryText: '#999999',
  card: '#1A1A1A',
  border: '#333333',
  accent: '#FF5524',
  error: '#FF3B30',
  success: '#34C759',
};

export const LIGHT_THEME: ThemeColors = {
  primary: '#FF5524',
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#666666',
  card: '#F5F5F5',
  border: '#E5E5E5',
  accent: '#FF5524',
  error: '#FF3B30',
  success: '#34C759',
};

export const getThemeColors = (theme: Theme): ThemeColors => {
  return theme === 'light' ? LIGHT_THEME : DARK_THEME;
};