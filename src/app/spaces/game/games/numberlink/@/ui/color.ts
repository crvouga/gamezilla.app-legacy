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

const COLOR_TO_HEX_BRIGHT = {
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#9333ea',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
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
