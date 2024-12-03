import { VDOM_IMPL_CURRENT } from '~/config-public'
import { Inferno } from 'inferno'
import { VDomImpl } from './vdom-impl'

export type StylesObjectKebab = Inferno.HTMLAttributes<HTMLDivElement>['style']
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

export const styles = (
  stylesObject: StylesObjectKebab,
  vdomImpl: VDomImpl = VDOM_IMPL_CURRENT
): Record<string, unknown> => {
  switch (vdomImpl) {
    case 'inferno':
    case 'preact': {
      return stylesObject as Record<string, unknown>
    }
    case 'react-with-compiler':
    case 'react': {
      return kebabObjectToCamelObject(stylesObject) as Record<string, unknown>
    }
  }
}
