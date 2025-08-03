const HAS_PIXEL_UNIT = new Set([
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'padding',
  'font-size',
  'font-weight',
  'font-family',
  'font-style',
  'text-align',
  'text-decoration',
  'text-transform',
  'border-width',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
])

export const hasPixelUnit = (key: string): boolean => {
  return HAS_PIXEL_UNIT.has(key)
}
