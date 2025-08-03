export type ThemeRounded = 'full' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'

const BORDER_RADIUS_MAP: { [key in ThemeRounded]: number } = {
  full: 9999,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
}

export const ThemeRounded = {
  BORDER_RADIUS_MAP,
}
