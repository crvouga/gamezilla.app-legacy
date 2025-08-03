import { inPlaceMapKeys } from '~/@/object/in-place-map-keys'
import { isObject } from '~/@/object/is-object'
import { kebabToCamel } from '~/@/string/kebab-to-camel'

export const REACT_JS_PROP_MAP = new Map<string, string>()
REACT_JS_PROP_MAP.set('class', 'className')
REACT_JS_PROP_MAP.set('stroke-linecap', 'strokeLinecap')
REACT_JS_PROP_MAP.set('stroke-linejoin', 'strokeLinejoin')
REACT_JS_PROP_MAP.set('stroke-width', 'strokeWidth')
REACT_JS_PROP_MAP.set('stroke-opacity', 'strokeOpacity')
REACT_JS_PROP_MAP.set('clip-rule', 'clipRule')
REACT_JS_PROP_MAP.set('fill-rule', 'fillRule')
export const REACT_JS_PROP_MAP_KEYS = Array.from(REACT_JS_PROP_MAP.keys())

export const inPlaceMapPropsToReactProps = (props: Record<string, unknown>, tag: unknown) => {
  try {
    if (isObject(props?.style)) {
      inPlaceMapKeys(props?.style, (key) => kebabToCamel(key))
    }

    if (typeof tag === 'string') {
      for (const propKey of REACT_JS_PROP_MAP_KEYS) {
        if (propKey in props) {
          props[REACT_JS_PROP_MAP.get(propKey)!] = props[propKey]
          delete props[propKey]
        }
      }
    }
  } catch (e) {
    // pass
  }
}
