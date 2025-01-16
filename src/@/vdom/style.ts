import { CONFIG_FRONTEND } from '~/config/frontend'
import { CONFIG_SHARED } from '~/config/shared'
import { VDomImpl } from './vdom-impl'

export type StylesObjectKebab = { [key: string]: string | number | undefined | null | false }
export type StylesObjectCamel = React.CSSProperties
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

const VDOM_IMPL_DEFAULT = CONFIG_SHARED.IS_TEST ? CONFIG_FRONTEND.VDOM_IMPL_TEST : CONFIG_FRONTEND.VDOM_IMPL

export const styles = (
  stylesObject: StylesObjectKebab,
  vdomImpl: VDomImpl = VDOM_IMPL_DEFAULT,
): Record<string, unknown> => {
  switch (vdomImpl) {
    case 'react-with-compiler':
    case 'react': {
      return kebabObjectToCamelObject(stylesObject) as Record<string, unknown>
    }
    default: {
      return stylesObject as Record<string, unknown>
    }
  }
}
