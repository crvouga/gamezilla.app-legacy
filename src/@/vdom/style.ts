import type { CSSProperties } from 'preact/compat'

export type StylesObjectKebab = { [key: string]: string | number | undefined | null | false }
export type StylesObjectCamel = React.CSSProperties & CSSProperties
export type StylesObject = StylesObjectKebab | StylesObjectCamel

export const camelStringToKebabString = (camelString: string): string => {
  return camelString.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const kebabStringToCamelString = (kebabString: string): string => {
  return kebabString.replace(/-([a-z])/g, (g) => g[1]!.toUpperCase())
}

export const kebabObjectToCamelObject = (kebabObject: StylesObjectKebab): StylesObjectCamel => {
  const camelObject: StylesObjectCamel = {}

  if (typeof kebabObject !== 'object') {
    return camelObject
  }

  for (const kebabKey in kebabObject) {
    const kebabValue =
      // @ts-ignore
      kebabObject[kebabKey]
    const camelKey = kebabStringToCamelString(kebabKey)
    // @ts-ignore
    camelObject[camelKey] = kebabValue
  }

  return camelObject
}

export const camelObjectToKebabObject = (camelObject: StylesObjectCamel): StylesObjectKebab => {
  const kebabObject: StylesObjectKebab = {}

  for (const camelKey in camelObject) {
    const camelValue = camelObject[camelKey]
    const kebabKey = camelStringToKebabString(camelKey)
    // @ts-ignore
    kebabObject[kebabKey] = camelValue
  }

  return kebabObject
}
