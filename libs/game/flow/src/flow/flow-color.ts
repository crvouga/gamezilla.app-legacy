const colorToHexMap = {
  blue: '#3b82f6',
  violet: '#8b5cf6',
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
  indigo: '#6366f1',
  purple: '#8b5cf6',
  pink: '#ec4899',
  rose: '#f43f5e',
  fuchsia: '#d946ef',
} as const;

const colorToHex = (color: Color): string => {
  return colorToHexMap[color];
};

export type Color = keyof typeof colorToHexMap;

const isColor = (value: string): value is Color => {
  return value in colorToHexMap;
};

const colorToEmojiMap: { [key in Color]: Emoji } = {
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
};

const colorToEmoji = (color: Color): Emoji => {
  return colorToEmojiMap[color];
};

const allColors = Object.keys(colorToHexMap) as Color[];

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
  | '💜'; // fuchsia

const emojiToColorMap: { [key in Emoji]: Color } = {
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
};

const allEmoji = Object.keys(emojiToColorMap) as Emoji[];

const emojiToColor = (emoji: Emoji): Color => {
  return emojiToColorMap[emoji];
};

export const isEmoji = (value: string): value is Emoji => {
  return value in emojiToColorMap;
};

const emojiToHex = (emoji: Emoji): string => {
  return colorToHex(emojiToColor(emoji));
};

export const Emoji = {
  is: isEmoji,
  fromColor: colorToEmoji,
  all: allEmoji,
  toHex: emojiToHex,
};

export const Color = {
  is: isColor,
  fromEmoji: emojiToColor,
  all: allColors,
  toHex: colorToHex,
};
