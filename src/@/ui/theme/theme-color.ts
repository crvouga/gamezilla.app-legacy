export type ThemeColorBase = 'neutral' | 'red' | 'blue' | 'yellow' | 'green' | 'orange'

export type ThemeColorLevel = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

export type ThemeColorOpacity = '' | '/5' | '/10' | '/20' | '/30' | '/40' | '/50' | '/60' | '/70' | '/80' | '/90'

export type ThemeColor =
  | `${ThemeColorBase}-${ThemeColorLevel}${ThemeColorOpacity}`
  | `white${ThemeColorOpacity}`
  | `black${ThemeColorOpacity}`

const palette: Record<ThemeColorBase, Record<ThemeColorLevel, string>> = {
  neutral: {
    '50': '#f9fafb',
    '100': '#f5f5f5',
    '200': '#e5e5e5',
    '300': '#d4d4d4',
    '400': '#a3a3a3',
    '500': '#737373',
    '600': '#525252',
    '700': '#404040',
    '800': '#262626',
    '900': '#171717',
  },
  red: {
    '50': '#fef2f2',
    '100': '#fee2e2',
    '200': '#fecaca',
    '300': '#fca5a5',
    '400': '#f87171',
    '500': '#ef4444',
    '600': '#dc2626',
    '700': '#b91c1c',
    '800': '#991b1b',
    '900': '#7f1d1d',
  },
  blue: {
    '50': '#eff6ff',
    '100': '#dbeafe',
    '200': '#bfdbfe',
    '300': '#93c5fd',
    '400': '#60a5fa',
    '500': '#3b82f6',
    '600': '#2563eb',
    '700': '#1d4ed8',
    '800': '#1e40af',
    '900': '#1e3a8a',
  },
  yellow: {
    '50': '#fefce8',
    '100': '#fef9c3',
    '200': '#fef08a',
    '300': '#fde047',
    '400': '#facc15',
    '500': '#eab308',
    '600': '#ca8a04',
    '700': '#a16207',
    '800': '#854d0e',
    '900': '#713f12',
  },
  green: {
    '50': '#f0fdf4',
    '100': '#dcfce7',
    '200': '#bbf7d0',
    '300': '#86efac',
    '400': '#4ade80',
    '500': '#22c55e',
    '600': '#16a34a',
    '700': '#15803d',
    '800': '#166534',
    '900': '#14532d',
  },
  orange: {
    '50': '#fff7ed',
    '100': '#ffedd5',
    '200': '#fed7aa',
    '300': '#fdba74',
    '400': '#fb923c',
    '500': '#f97316',
    '600': '#ea580c',
    '700': '#c2410c',
    '800': '#9a3412',
    '900': '#7c2d12',
  },
}

const toHex = (color: ThemeColor): string => {
  const [baseLevel, opacity] = color.split('/') as [string, string?]

  let hex: string
  if (baseLevel === 'white') {
    hex = '#ffffff'
  } else if (baseLevel === 'black') {
    hex = '#000000'
  } else {
    const [base, level] = baseLevel.split('-') as [ThemeColorBase, ThemeColorLevel]
    hex = palette[base]?.[level]
    if (!hex) {
      throw new Error(`Unknown color: ${color}`)
    }
  }

  if (!opacity || opacity === '') {
    return hex
  }

  // opacity like "50" meaning 50% → alpha = 0.5
  const alpha = (parseInt(opacity, 10) / 1000) * 10 // /100
  const clamped = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1
  return hex + toHexAlpha(clamped)
}

const toHexAlpha = (alpha: number): string => {
  const a = Math.round(alpha * 255)
  const hex = a.toString(16).padStart(2, '0')
  return hex
}

export const ThemeColor = {
  toHex,
}
