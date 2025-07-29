import { ThemeColor } from './theme-color'

export type Theme = {
  position?: 'absolute' | 'relative' | null
  flexDirection?: 'row' | 'col' | null
  flex?: number | null
  items?: 'center' | 'start' | 'end' | 'stretch' | 'baseline' | null
  justify?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly' | null
  p?: number | null
  px?: number | null
  py?: number | null
  pt?: number | null
  pb?: number | null
  pl?: number | null
  pr?: number | null
  rounded?: 'full' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | null
  textColor?: ThemeColor | null
  fontWeight?: 'normal' | 'bold' | 'black' | null
  textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | null
  backgroundColor?: ThemeColor | null

  borderColor?: ThemeColor | null
  width?: 'full' | number | null
  height?: 'full' | number | null
  borderWidth?: number | null
  gap?: number | null
  inset?: number | null
}

export const theme = (config: Theme): Record<string, string | number | null> => {
  const styles: Record<string, string | number | null> = {}
  applyPosition(styles, config.position)
  applyFlex(styles, config.flexDirection, config.flex)
  applyItems(styles, config.items)
  applyJustify(styles, config.justify)
  applyPadding(styles, config)
  applyBorderRadius(styles, config.rounded)
  applyFontWeight(styles, config.fontWeight)
  applyFontSize(styles, config.textSize)
  applyColors(styles, config)
  applyWidth(styles, config.width)
  applyHeight(styles, config.height)
  applyBorderWidth(styles, config.borderWidth)
  applyGap(styles, config.gap)
  applyInset(styles, config.inset)
  return styles
}

const applyGap = (styles: Record<string, string | number | null>, gap: number | null | undefined) => {
  if (gap != null) {
    styles.gap = gap * 4
  }
}

const applyPosition = (styles: Record<string, string | number | null>, position: Theme['position']) => {
  if (!position) return
  styles.position = position
}

const applyFlex = (
  styles: Record<string, string | number | null>,
  flexDirection: 'row' | 'col' | null | undefined,
  flex: number | null | undefined,
) => {
  styles.display = 'flex'
  styles.flexDirection = flexDirection === 'row' ? 'row' : 'column'
  styles.flex = flex ?? null
}

const applyItems = (styles: Record<string, string | number | null>, items: Theme['items']) => {
  if (!items) return
  styles.alignItems = items
}

const applyJustify = (styles: Record<string, string | number | null>, justify: Theme['justify']) => {
  if (!justify) return
  styles.justifyContent = justify
}

const applyPadding = (styles: Record<string, string | number | null>, config: Theme) => {
  const { p, px, py, pt, pb, pl, pr } = config

  if (p != null) {
    styles.padding = p * 4
  }

  if (px != null) {
    styles.paddingLeft = px * 4
    styles.paddingRight = px * 4
  }
  if (py != null) {
    styles.paddingTop = py * 4
    styles.paddingBottom = py * 4
  }
  if (pt != null) {
    styles.paddingTop = pt * 4
  }
  if (pb != null) {
    styles.paddingBottom = pb * 4
  }
  if (pl != null) {
    styles.paddingLeft = pl * 4
  }
  if (pr != null) {
    styles.paddingRight = pr * 4
  }
}

const applyBorderRadius = (styles: Record<string, string | number | null>, rounded: Theme['rounded']) => {
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
const applyFontWeight = (styles: Record<string, string | number | null>, weight: Theme['fontWeight']) => {
  if (!weight) return
  styles.fontWeight = FONT_WEIGHT_MAP[weight] ?? 400
}

const SIZE_MAP = {
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
const applyFontSize = (styles: Record<string, string | number | null>, size: Theme['textSize']) => {
  if (!size) return
  styles.fontSize = SIZE_MAP[size] ?? 16
}

const applyColors = (styles: Record<string, string | number | null>, config: Theme) => {
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

const applyWidth = (styles: Record<string, string | number | null>, width: 'full' | number | null | undefined) => {
  if (width === 'full') {
    styles.width = '100%'
    return
  }
  if (width != null) {
    styles.width = width * 4
  }
}

const applyHeight = (styles: Record<string, string | number | null>, height: 'full' | number | null | undefined) => {
  if (height === 'full') {
    styles.height = '100%'
    return
  }
  if (height != null) {
    styles.height = height * 4
  }
}

const applyBorderWidth = (styles: Record<string, string | number | null>, borderWidth: number | null | undefined) => {
  if (borderWidth != null) {
    styles.borderWidth = borderWidth * 1
  }
}

const applyInset = (styles: Record<string, string | number | null>, inset: number | null | undefined) => {
  if (inset != null) {
    styles.inset = inset * 4
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
