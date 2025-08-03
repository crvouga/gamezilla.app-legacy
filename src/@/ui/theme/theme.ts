import { ThemeColor } from './theme-color'
import { ThemeSize } from './theme-size'

export type Theme = {
  position?: 'absolute' | 'relative' | null
  flexDirection?: 'row' | 'col' | null
  flex?: number | null
  flexGrow?: number | null
  flexShrink?: number | null
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline' | null
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | null
  padding?: number | null
  paddingX?: number | null
  paddingY?: number | null
  paddingTop?: number | null
  paddingBottom?: number | null
  paddingLeft?: number | null
  paddingRight?: number | null
  overflow?: 'hidden' | null
  opacity?: number | null
  pointerEvents?: 'none' | 'auto' | null
  rounded?: 'full' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | null
  textColor?: ThemeColor | null
  fontWeight?: 'normal' | 'bold' | 'black' | null
  fontSize?: ThemeSize | number | null
  backgroundColor?: ThemeColor | null
  textAlign?: 'left' | 'center' | 'right' | null
  borderColor?: ThemeColor | null
  width?: 'full' | '1/2' | number | null
  maxWidth?: 'full' | '1/2' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | number | null
  height?: 'full' | '1/2' | number | null
  size?: number | null
  borderWidth?: number | null
  gap?: number | null
  inset?: number | null
  minWidth?: ThemeSize | null
  aspectRatio?: number | null
  zIndex?: number | null
  top?: number | null
  right?: number | null
  bottom?: number | null
  left?: number | null
}

export const theme = (config: Theme): Record<string, string | number | null> => {
  const styles: Record<string, string | number | null> = {}
  applyMinWidth(styles, config.minWidth)
  applyMaxWidth(styles, config.maxWidth)
  applyPosition(styles, config.position)
  applyFlex(styles, config)
  applyItems(styles, config.alignItems)
  applyJustify(styles, config.justifyContent)
  applyPadding(styles, config)
  applyBorderRadius(styles, config.rounded)
  applyFontWeight(styles, config.fontWeight)
  applyFontSize(styles, config.fontSize)
  applyTextAlign(styles, config.textAlign)
  applyColors(styles, config)
  applySize(styles, config.size)
  applyWidth(styles, config.width)
  applyHeight(styles, config.height)
  applyBorderWidth(styles, config.borderWidth)
  applyGap(styles, config.gap)
  applyInset(styles, config.inset)
  applyPointerEvents(styles, config.pointerEvents)
  applyOverflow(styles, config.overflow)
  applyOpacity(styles, config.opacity)
  applyAspectRatio(styles, config.aspectRatio)
  applyZIndex(styles, config.zIndex)
  applyTop(styles, config.top)
  applyRight(styles, config.right)
  applyBottom(styles, config.bottom)
  applyLeft(styles, config.left)
  return styles
}

const applyGap = (styles: Record<string, string | number | null>, gap: number | null | undefined) => {
  if (gap != null) {
    styles.gap = gap * 4
  }
}

const applySize = (styles: Record<string, string | number | null>, size: number | null | undefined) => {
  if (size != null) {
    styles.width = size * 4
    styles.height = size * 4
  }
}

const applyOpacity = (styles: Record<string, string | number | null>, opacity: number | null | undefined) => {
  if (opacity != null) {
    styles.opacity = opacity
  }
}

const applyMaxWidth = (styles: Record<string, string | number | null>, maxWidth: Theme['maxWidth']) => {
  if (!maxWidth) return
  if (maxWidth === 'full') {
    styles.maxWidth = '100%'
  }
  if (maxWidth === '1/2') {
    styles.maxWidth = '50%'
  }
  switch (maxWidth) {
    case 'sm':
      styles.maxWidth = 32
      break
    case 'md':
      styles.maxWidth = 40
      break
    case 'lg':
      styles.maxWidth = 48
      break
    case 'xl':
      styles.maxWidth = 56
      break
    case '2xl':
      styles.maxWidth = 64
      break
    case '3xl':
      styles.maxWidth = 72
      break
    case '4xl':
      styles.maxWidth = 80
      break
  }
  if (typeof maxWidth === 'number') {
    styles.maxWidth = maxWidth * 4
  }
}

const applyMinWidth = (styles: Record<string, string | number | null>, minWidth: Theme['minWidth']) => {
  if (!minWidth) return
  switch (minWidth) {
    case 'xs':
      styles.minWidth = 16
      break
    case 'sm':
      styles.minWidth = 24
      break
    case 'md':
      styles.minWidth = 32
      break
    case 'lg':
      styles.minWidth = 40
      break
    case 'xl':
      styles.minWidth = 48
      break
    case '2xl':
      styles.minWidth = 56
      break
    case '3xl':
      styles.minWidth = 64
      break
    case '4xl':
      styles.minWidth = 72
      break
    case '5xl':
      styles.minWidth = 80
      break
    default:
      break
  }
}

const applyPosition = (styles: Record<string, string | number | null>, position: Theme['position']) => {
  if (!position) return
  styles.position = position
}

const applyFlex = (styles: Record<string, string | number | null>, config: Theme) => {
  styles.display = 'flex'
  if (config.flexDirection) {
    styles.flexDirection = config.flexDirection === 'row' ? 'row' : 'column'
  }
  if (config.flex) {
    styles.flex = config.flex
  }
  if (typeof config.flexGrow === 'number') {
    styles.flexGrow = config.flexGrow
  }

  if (typeof config.flexShrink === 'number') {
    styles.flexShrink = config.flexShrink
  }
}

const applyItems = (styles: Record<string, string | number | null>, items: Theme['alignItems']) => {
  if (!items) return
  styles.alignItems = items
}

const applyJustify = (styles: Record<string, string | number | null>, justify: Theme['justifyContent']) => {
  if (!justify) return
  styles.justifyContent = justify
}

const applyPadding = (styles: Record<string, string | number | null>, config: Theme) => {
  const {
    padding: p,
    paddingX: px,
    paddingY: py,
    paddingTop: pt,
    paddingBottom: pb,
    paddingLeft: pl,
    paddingRight: pr,
  } = config

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
const applyFontSize = (styles: Record<string, string | number | null>, size: Theme['fontSize']) => {
  if (!size) return
  if (typeof size === 'number') {
    styles.fontSize = size
    return
  }
  styles.fontSize = SIZE_MAP[size] ?? 16
}

const applyTextAlign = (styles: Record<string, string | number | null>, textAlign: Theme['textAlign']) => {
  if (!textAlign) return
  styles.textAlign = textAlign
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

const applyWidth = (
  styles: Record<string, string | number | null>,
  width: 'full' | '1/2' | number | null | undefined,
) => {
  if (width === 'full') {
    styles.width = '100%'
    return
  }
  if (width === '1/2') {
    styles.width = '50%'
    return
  }
  if (width != null) {
    styles.width = width * 4
  }
}

const applyHeight = (
  styles: Record<string, string | number | null>,
  height: 'full' | '1/2' | number | null | undefined,
) => {
  if (height === 'full') {
    styles.height = '100%'
    return
  }
  if (height === '1/2') {
    styles.height = '50%'
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

const applyPointerEvents = (styles: Record<string, string | number | null>, pointerEvents: Theme['pointerEvents']) => {
  if (pointerEvents != null) {
    styles.pointerEvents = pointerEvents
  }
}

const applyOverflow = (styles: Record<string, string | number | null>, overflow: Theme['overflow']) => {
  if (overflow != null) {
    styles.overflow = overflow
  }
}

const applyAspectRatio = (styles: Record<string, string | number | null>, aspectRatio: Theme['aspectRatio']) => {
  if (aspectRatio != null) {
    styles.aspectRatio = aspectRatio
  }
}

const applyZIndex = (styles: Record<string, string | number | null>, zIndex: Theme['zIndex']) => {
  if (zIndex != null) {
    styles.zIndex = zIndex
  }
}

const applyTop = (styles: Record<string, string | number | null>, top: Theme['top']) => {
  if (top != null) {
    styles.top = top * 4
  }
}

const applyRight = (styles: Record<string, string | number | null>, right: Theme['right']) => {
  if (right != null) {
    styles.right = right * 4
  }
}

const applyBottom = (styles: Record<string, string | number | null>, bottom: Theme['bottom']) => {
  if (bottom != null) {
    styles.bottom = bottom * 4
  }
}

const applyLeft = (styles: Record<string, string | number | null>, left: Theme['left']) => {
  if (left != null) {
    styles.left = left * 4
  }
}

export const Theme = {}
