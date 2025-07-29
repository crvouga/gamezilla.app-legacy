import { ThemeColor } from './theme-color'

export type ThemeConfig = {
  flex?: 'row' | 'col' | null
  items?: 'center' | 'start' | 'end' | 'stretch' | 'baseline' | null
  justify?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly' | null
  px?: number | null
  py?: number | null
  rounded?: 'full' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | null
  textColor?: ThemeColor | null
  fontWeight?: 'normal' | 'bold' | 'black' | null
  textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | null
  backgroundColor?: ThemeColor | null
  borderColor?: ThemeColor | null
  width?: number | null
  height?: number | null
  borderWidth?: number | null
}

export const theme = (config: ThemeConfig): Record<string, string | number | null> => {
  const styles: Record<string, string | number | null> = {}
  applyFlex(styles, config.flex)
  applyItems(styles, config.items)
  applyJustify(styles, config.justify)
  applyPadding(styles, config.px, config.py)
  applyBorderRadius(styles, config.rounded)
  applyFontWeight(styles, config.fontWeight)
  applyFontSize(styles, config.textSize)
  applyColors(styles, config)
  applyWidth(styles, config.width)
  applyHeight(styles, config.height)
  applyBorderWidth(styles, config.borderWidth)
  return styles
}

const applyFlex = (styles: Record<string, string | number | null>, flex: 'row' | 'col' | null | undefined) => {
  if (!flex) return
  styles.display = 'flex'
  styles.flexDirection = flex === 'row' ? 'row' : 'column'
}

const applyItems = (styles: Record<string, string | number | null>, items: ThemeConfig['items']) => {
  if (!items) return
  styles.alignItems = items
}

const applyJustify = (styles: Record<string, string | number | null>, justify: ThemeConfig['justify']) => {
  if (!justify) return
  styles.justifyContent = justify
}

const applyPadding = (
  styles: Record<string, string | number | null>,
  px: number | null | undefined,
  py: number | null | undefined,
) => {
  if (px != null) {
    styles.paddingLeft = px * 4
    styles.paddingRight = px * 4
  }
  if (py != null) {
    styles.paddingTop = py * 4
    styles.paddingBottom = py * 4
  }
}

const applyBorderRadius = (styles: Record<string, string | number | null>, rounded: ThemeConfig['rounded']) => {
  if (!rounded) return
  const radiusMap = {
    full: 9999,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
  }
  styles.borderRadius = radiusMap[rounded] ?? 0
}

const FONT_WEIGHT_MAP = {
  normal: 400,
  bold: 700,
  black: 900,
}
const applyFontWeight = (styles: Record<string, string | number | null>, weight: ThemeConfig['fontWeight']) => {
  if (!weight) return
  styles.fontWeight = FONT_WEIGHT_MAP[weight] ?? 400
}

const applyFontSize = (styles: Record<string, string | number | null>, size: ThemeConfig['textSize']) => {
  if (!size) return
  const sizeMap = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  }
  styles.fontSize = sizeMap[size] ?? 16
}

const applyColors = (styles: Record<string, string | number | null>, config: ThemeConfig) => {
  if (config.textColor) {
    styles.color = ThemeColor.toHex(config.textColor)
  }
  if (config.backgroundColor) {
    styles.backgroundColor = ThemeColor.toHex(config.backgroundColor)
  }
  if (config.borderColor) {
    styles.borderColor = ThemeColor.toHex(config.borderColor)
  }
}

const applyWidth = (styles: Record<string, string | number | null>, width: number | null | undefined) => {
  if (width != null) {
    styles.width = width * 4
  }
}

const applyHeight = (styles: Record<string, string | number | null>, height: number | null | undefined) => {
  if (height != null) {
    styles.height = height * 4
  }
}

const applyBorderWidth = (styles: Record<string, string | number | null>, borderWidth: number | null | undefined) => {
  if (borderWidth != null) {
    styles.borderWidth = borderWidth * 1
  }
}

const normalizeToWebStandard = (
  styles: Record<string, string | number | null>,
): Record<string, string | number | null> => {
  for (const key in styles) {
    if (styles[key] === null) {
      delete styles[key]
    } else if (typeof styles[key] === 'number') {
      styles[key] = `${styles[key]}px`
    }
  }
  return styles
}

const normalizeToReactNativeStandard = (
  styles: Record<string, string | number | null>,
): Record<string, string | number | null> => {
  return styles
}

export const Theme = {
  normalizeToWebStandard,
  normalizeToReactNativeStandard,
}
