import { kebabObjectToCamelObject, StylesObjectKebab } from '../style'

export const REACT_JS_PROP_MAP = new Map<string, string>()
REACT_JS_PROP_MAP.set('class', 'className')
REACT_JS_PROP_MAP.set('stroke-linecap', 'strokeLinecap')
REACT_JS_PROP_MAP.set('stroke-linejoin', 'strokeLinejoin')
REACT_JS_PROP_MAP.set('stroke-width', 'strokeWidth')
REACT_JS_PROP_MAP.set('stroke-opacity', 'strokeOpacity')
REACT_JS_PROP_MAP.set('clip-rule', 'clipRule')
REACT_JS_PROP_MAP.set('fill-rule', 'fillRule')
export const REACT_JS_PROP_MAP_KEYS = Array.from(REACT_JS_PROP_MAP.keys())

export const normalizePropsInPlace = (props: Record<string, unknown>, tag: unknown) => {
  if (props?.style) {
    props.style = kebabObjectToCamelObject(props?.style as StylesObjectKebab)
  }

  if (typeof tag === 'string') {
    for (const propKey of REACT_JS_PROP_MAP_KEYS) {
      if (propKey in props) {
        props[REACT_JS_PROP_MAP.get(propKey)!] = props[propKey]
        delete props[propKey]
      }
    }
  }
}

export const normalizeChildren = (children: unknown) => {
  return Array.isArray(children) ? children : children ? [children] : []
}
