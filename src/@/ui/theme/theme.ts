import { ThemeColor } from './theme-color'
import { ThemeRounded } from './theme-rounded'
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
  rounded?: ThemeRounded | null
  roundedTop?: ThemeRounded | null
  roundedBottom?: ThemeRounded | null
  textColor?: ThemeColor | null
  fontWeight?: 'normal' | 'bold' | 'black' | null
  fontSize?: ThemeSize | number | null
  backgroundColor?: ThemeColor | null
  textAlign?: 'left' | 'center' | 'right' | null
  borderColor?: ThemeColor | null
  width?: 'full' | '1/2' | number | null
  height?: 'full' | '1/2' | number | null
  size?: number | null
  borderWidth?: number | null
  borderXWidth?: number | null
  borderYWidth?: number | null
  gap?: number | null
  inset?: number | null
  maxWidth?: 'full' | '1/2' | ThemeSize | number | null
  minWidth?: ThemeSize | null
  aspectRatio?: number | null
  zIndex?: number | null
  top?: number | null
  right?: number | null
  bottom?: number | null
  left?: number | null
  display?: 'flex' | 'none' | null
}

export const sx = (config: Theme): Record<string, string | number | null> => {
  const styles: Record<string, string | number | null> = {}
  applyMinWidth(styles, config.minWidth)
  applyMaxWidth(styles, config.maxWidth)
  applyPosition(styles, config.position)
  applyFlex(styles, config)
  applyItems(styles, config.alignItems)
  applyJustify(styles, config.justifyContent)
  applyPadding(styles, config)
  applyBorderRadius(styles, config)
  applyFontWeight(styles, config.fontWeight)
  applyFontSize(styles, config.fontSize)
  applyTextAlign(styles, config.textAlign)
  applyColors(styles, config)
  applySize(styles, config.size)
  applyWidth(styles, config.width)
  applyHeight(styles, config.height)
  applyBorderWidth(styles, config)
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
  applyDisplay(styles, config.display)
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
  switch (maxWidth) {
    case 'full':
      styles.maxWidth = '100%'
      break
    case '1/2':
      styles.maxWidth = '50%'
      break
    case '3xs':
    case '2xs':
    case 'xs':
    case 'sm':
    case 'md':
    case 'lg':
    case 'xl':
    case '2xl':
    case '3xl':
    case '4xl':
    case '5xl':
    case '6xl':
    case '7xl':
      styles.minWidth = ThemeSize.toWidthPixel(maxWidth)
      break
  }
  if (typeof maxWidth === 'number') {
    styles.maxWidth = maxWidth * 4
  }
}

const applyMinWidth = (styles: Record<string, string | number | null>, minWidth: Theme['minWidth']) => {
  if (!minWidth) return
  switch (minWidth) {
    case '3xs':
    case '2xs':
    case 'xs':
    case 'sm':
    case 'md':
    case 'lg':
    case 'xl':
    case '2xl':
    case '3xl':
    case '4xl':
    case '5xl':
    case '6xl':
    case '7xl':
      styles.minWidth = ThemeSize.toWidthPixel(minWidth)
      break
    default:
      if (typeof minWidth === 'number') {
        styles.minWidth = minWidth * 4
      }
      break
  }
}

const applyPosition = (styles: Record<string, string | number | null>, position: Theme['position']) => {
  if (!position) return
  styles.position = position
}

const applyFlex = (styles: Record<string, string | number | null>, config: Theme) => {
  if (config.flexDirection) {
    styles.display = 'flex'
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
  const { padding, paddingX, paddingY, paddingTop, paddingBottom, paddingLeft, paddingRight } = config

  if (padding != null) {
    styles.padding = padding * 4
  }

  if (paddingX != null) {
    styles.paddingLeft = paddingX * 4
    styles.paddingRight = paddingX * 4
  }

  if (paddingY != null) {
    styles.paddingTop = paddingY * 4
    styles.paddingBottom = paddingY * 4
  }

  if (paddingTop != null) {
    styles.paddingTop = paddingTop * 4
  }

  if (paddingBottom != null) {
    styles.paddingBottom = paddingBottom * 4
  }

  if (paddingLeft != null) {
    styles.paddingLeft = paddingLeft * 4
  }

  if (paddingRight != null) {
    styles.paddingRight = paddingRight * 4
  }
}

const applyBorderRadius = (styles: Record<string, string | number | null>, config: Theme) => {
  const { rounded, roundedTop, roundedBottom } = config

  if (rounded) {
    styles.borderRadius = ThemeRounded.BORDER_RADIUS_MAP[rounded] ?? 0
  }

  if (roundedTop) {
    styles.borderTopLeftRadius = ThemeRounded.BORDER_RADIUS_MAP[roundedTop]
    styles.borderTopRightRadius = ThemeRounded.BORDER_RADIUS_MAP[roundedTop] ?? 0
  }

  if (roundedBottom) {
    styles.borderBottomLeftRadius = ThemeRounded.BORDER_RADIUS_MAP[roundedBottom] ?? 0
    styles.borderBottomRightRadius = ThemeRounded.BORDER_RADIUS_MAP[roundedBottom] ?? 0
  }
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
  '3xs': 10,
  '2xs': 11,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
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

const applyBorderWidth = (styles: Record<string, string | number | null>, config: Theme) => {
  const { borderWidth, borderXWidth, borderYWidth } = config
  if (borderWidth != null) {
    styles.borderWidth = borderWidth * 1
  }
  if (borderXWidth != null) {
    styles.borderLeftWidth = borderXWidth * 1
    styles.borderRightWidth = borderXWidth * 1
  }
  if (borderYWidth != null) {
    styles.borderTopWidth = borderYWidth * 1
    styles.borderBottomWidth = borderYWidth * 1
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

const applyDisplay = (styles: Record<string, string | number | null>, display: Theme['display']) => {
  if (display != null) {
    styles.display = display
  }
}

export const Theme = {}
