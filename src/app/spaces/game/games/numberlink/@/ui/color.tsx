import { GroupId } from '../numberlink/group-id'

// source: https://tailwindcss.com/docs/customizing-colors
const COLOR_TO_HEX = {
  red: '#FE0500',
  orange: '#ea580c',
  amber: '#d97706',
  yellow: '#EBDF04',
  lime: '#84cc16',
  green: '#068C01',
  emerald: '#10b981',
  teal: '#2dd4bf',
  cyan: '#22d3ee',
  sky: '#38bdf8',
  blue: '#0D2AFE',
  indigo: '#4f46e5',
  violet: '#7c3aed',
  purple: '#9333ea',
  fuchsia: '#c026d3',
  pink: '#ec4899',
  rose: '#e11d48',
} as const

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

const ALL_COLORS = Object.keys(COLOR_TO_HEX) as Color[]

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

export const Color = {
  all: ALL_COLORS,
  groupIdToColor: GROUP_ID_TO_COLOR,
  is,
  toHex,
  groupIdToHex,
}
