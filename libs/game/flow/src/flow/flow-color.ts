// source: https://tailwindcss.com/docs/customizing-colors
const colorToHexMap = {
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
