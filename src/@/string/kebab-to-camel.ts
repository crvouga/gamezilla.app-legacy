/**
 * Converts a kebab-case string to camelCase
 * @param kebabString The kebab-case string to convert
 * @returns The camelCase string
 * @example
 * kebabToCamel('foo-bar') // returns 'fooBar'
 * kebabToCamel('background-color') // returns 'backgroundColor'
 * kebabToCamel('border-top-width') // returns 'borderTopWidth'
 * kebabToCamel('font-size-12px') // returns 'fontSize12px'
 */
export const kebabToCamel = (kebabString: string): string => {
  return kebabString.replace(/-([a-z0-9])/g, (g) => g[1]!.toUpperCase())
}
