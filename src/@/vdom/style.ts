import type { CSSProperties } from 'preact/compat'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { VDomImpl } from './vdom-impl'

export type StylesObjectKebab = { [key: string]: string | number | undefined | null | false }
export type StylesObjectCamel = React.CSSProperties & CSSProperties
export type StylesObject = StylesObjectKebab | StylesObjectCamel

export const camelStringToKebabString = (camelString: string): string => {
  return camelString.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const kebabStringToCamelString = (kebabString: string): string => {
  return kebabString.replace(/-([a-z])/g, (g) => g[1]!.toUpperCase())
}

const kebabObjectToCamelObject = (kebabObject: StylesObjectKebab): StylesObjectCamel => {
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

export const styles = (stylesObject: StylesObjectKebab, vdomImpl: VDomImpl = CONFIG_FRONTEND.VDOM_IMPL): unknown => {
  switch (vdomImpl) {
    case 'react-with-compiler':
    case 'react': {
      return kebabObjectToCamelObject(stylesObject) as unknown
    }
    default: {
      return stylesObject as unknown
    }
  }
}
