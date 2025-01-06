import { Color } from './color'

const COLOR_TO_EMOJI: { [key in Color]: Emoji } = {
  blue: '🔵',
  violet: '🍇',
  red: '🔴',
  orange: '🟠',
  amber: '🚨',
  yellow: '🟡',
  lime: '🥝',
  green: '🟢',
  emerald: '❇️',
  teal: '🩱',
  cyan: '🌐',
  sky: '🏙',
  indigo: '🟪',
  purple: '🟣',
  pink: '🌸',
  rose: '🌹',
  fuchsia: '💜',
}

const colorToEmoji = (color: Color): Emoji => {
  return COLOR_TO_EMOJI[color]
}

export type Emoji =
  | '🔵' // blue
  | '🍇' // violet
  | '🔴' // red
  | '🟠' // orange
  | '🚨' // amber
  | '🟡' // yellow
  | '🥝' // lime
  | '🟢' // green
  | '❇️' // emerald
  | '🩱' // teal
  | '🌐' // cyan
  | '🏙' // sky
  | '🟪' // indigo
  | '🟣' // purple
  | '🌸' // pink
  | '🌹' // rose
  | '💜' // fuchsia

const EMOJI_TO_COLOR_MAP: { [key in Emoji]: Color } = {
  '🔵': 'blue',
  '🍇': 'violet',
  '🔴': 'red',
  '🟠': 'orange',
  '🚨': 'amber',
  '🟡': 'yellow',
  '🥝': 'lime',
  '🟢': 'green',
  '❇️': 'emerald',
  '🩱': 'teal',
  '🌐': 'cyan',
  '🏙': 'sky',
  '🟪': 'indigo',
  '🟣': 'purple',
  '🌸': 'pink',
  '🌹': 'rose',
  '💜': 'fuchsia',
}

const ALL_EMOJI = Object.keys(EMOJI_TO_COLOR_MAP) as Emoji[]

const emojiToColor = (emoji: Emoji): Color => {
  return EMOJI_TO_COLOR_MAP[emoji]
}

export const isEmoji = (value: string): value is Emoji => {
  return value in EMOJI_TO_COLOR_MAP
}

const emojiToHex = (emoji: Emoji): string => {
  return Color.toHex(emojiToColor(emoji))
}

export const Emoji = {
  is: isEmoji,
  fromColor: colorToEmoji,
  toColor: emojiToColor,
  all: ALL_EMOJI,
  toHex: emojiToHex,
}
