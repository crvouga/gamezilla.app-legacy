/**
 * Converts a camelCase string to kebab-case
 * @param camelString The camelCase string to convert
 * @returns The kebab-case string
 * @example
 * camelToKebab('fooBar') // returns 'foo-bar'
 * camelToKebab('backgroundColor') // returns 'background-color'
 * camelToKebab('borderTopWidth') // returns 'border-top-width'
 */
export const camelToKebab = (camelString: string): string => {
  return camelString.replace(/([A-Z])/g, '-$1').toLowerCase()
}
