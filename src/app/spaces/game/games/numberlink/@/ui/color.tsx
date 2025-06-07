import { GroupId } from '../numberlink/group-id'

const COLOR_TO_HEX_DIM = {
  red: '#dc2626',
  orange: '#ea580c',
  amber: '#d97706',
  yellow: '#ca8a04',
  lime: '#65a30d',
  green: '#16a34a',
  emerald: '#059669',
  teal: '#0d9488',
  cyan: '#0891b2',
  sky: '#0284c7',
  blue: '#2563eb',
  indigo: '#4f46e5',
  violet: '#7c3aed',
  purple: '#7e22ce',
  fuchsia: '#c026d3',
  pink: '#db2777',
  rose: '#e11d48',
} as const

// source: https://tailwindcss.com/docs/customizing-colors
const COLOR_TO_HEX_BRIGHT = {
  red: 'oklch(63.7% 0.237 25.331)',
  orange: 'oklch(70.5% 0.213 47.604)',
  amber: 'oklch(76.9% 0.188 70.08)',
  yellow: 'oklch(79.5% 0.184 86.047)',
  lime: 'oklch(76.8% 0.233 130.85)',
  green: 'oklch(72.3% 0.219 149.579)',
  emerald: 'oklch(69.6% 0.17 162.48)',
  teal: 'oklch(70.4% 0.14 182.503)',
  cyan: 'oklch(71.5% 0.143 215.221)',
  sky: 'oklch(68.5% 0.169 237.323)',
  blue: 'oklch(62.3% 0.214 259.815)',
  indigo: 'oklch(58.5% 0.233 277.117)',
  violet: 'oklch(60.6% 0.25 292.717)',
  purple: 'oklch(62.7% 0.265 303.9)',
  fuchsia: 'oklch(66.7% 0.295 322.15)',
  pink: 'oklch(65.6% 0.241 354.308)',
  rose: 'oklch(64.5% 0.246 16.439)',
} as const

const USE_DIM = false

const COLOR_TO_HEX = USE_DIM ? COLOR_TO_HEX_DIM : COLOR_TO_HEX_BRIGHT

export const GROUP_ID_TO_COLOR: { [groupId in GroupId]: Color } = {
  A: 'red',
  B: 'blue',
  C: 'yellow',
  D: 'green',
  E: 'pink',
  F: 'orange',
  G: 'purple',
  H: 'amber',
  I: 'lime',
  J: 'emerald',
  K: 'teal',
  L: 'cyan',
  M: 'sky',
  N: 'indigo',
  O: 'violet',
  P: 'fuchsia',
  Q: 'rose',
}

const ALL = Object.keys(COLOR_TO_HEX) as Color[]

const toHex = (color: Color): string => {
  return COLOR_TO_HEX[color]
}

export type Color = keyof typeof COLOR_TO_HEX

const is = (value: string): value is Color => {
  return value in COLOR_TO_HEX
}

const groupIdToHex = (groupId: GroupId): string => {
  return toHex(GROUP_ID_TO_COLOR[groupId])
}

const GRID_LINE_COLOR = 'green'
const BORDER_COLOR = '#000000'
const BACKGROUND_COLOR = '#000000'

export const Color = {
  GRID_LINE_COLOR,
  BORDER_COLOR,
  BACKGROUND_COLOR,
  ALL,
  GROUP_ID_TO_COLOR,
  is,
  toHex,
  groupIdToHex,
}
