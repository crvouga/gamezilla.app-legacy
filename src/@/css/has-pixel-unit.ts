import { camelToKebab } from '../string/camel-to-kebab'

const HAS_PIXEL_UNIT = new Set([
  // Dimensions & positioning
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'top',
  'left',
  'right',
  'bottom',
  'inset',
  'inset-top',
  'inset-right',
  'inset-bottom',
  'inset-left',

  // Spacing
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'gap',
  'row-gap',
  'column-gap',

  // Borders
  'border-width',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',

  // Typography
  'font-size',
  'letter-spacing',
  'line-height',
  'text-indent',
  'word-spacing',

  // Transforms
  'translate',
  'translate-x',
  'translate-y',

  // Shadows
  'box-shadow',
  'text-shadow',

  // SVG-related
  'rx',
  'ry',
  'x',
  'y',

  // Animations
  'stroke-dashoffset',
  'stroke-width',

  // Misc
  'outline-width',
  'perspective',
  'object-position',
  'background-position',
  'background-size',
])

export const hasPixelUnit = (key: string): boolean => {
  return HAS_PIXEL_UNIT.has(key) || HAS_PIXEL_UNIT.has(camelToKebab(key))
}
