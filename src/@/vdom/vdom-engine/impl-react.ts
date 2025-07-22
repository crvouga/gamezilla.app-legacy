import { createElement, Fragment, StrictMode } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { FRAGMENT_TAG } from '../primitives/frag'
import { kebabObjectToCamelObject } from '../style'
import { IVirtualDomEngine } from './interface'
import { REACT_JS_PROP_MAP, REACT_JS_PROP_MAP_KEYS } from './react'

export type ImplReact = {
  t: 'react'
}

const init = (_config: ImplReact): IVirtualDomEngine => {
  let reactRoot: ReturnType<typeof createRoot> | undefined
  return {
    render: (vDom, node) => {
      reactRoot ??= createRoot(node)
      reactRoot.render(createElement(StrictMode, {}, vDom as any))
    },
    // @ts-ignore
    createPortal: (vDom, container) => {
      const portal = createPortal(vDom as any, container)
      return portal
    },
    createElement: (tag: any, props: any, children: any) => {
      if (props?.style) {
        props.style = kebabObjectToCamelObject(props?.style)
      }

      if (typeof tag === 'string') {
        for (const propKey of REACT_JS_PROP_MAP_KEYS) {
          if (propKey in props) {
            props[REACT_JS_PROP_MAP.get(propKey)!] = props[propKey]
            delete props[propKey]
          }
        }
      }

      children = Array.isArray(children) ? children : children ? [children] : []

      switch (tag) {
        case FRAGMENT_TAG: {
          return createElement(Fragment, props, ...children) as any
        }
        default: {
          return createElement(tag, props, ...children) as any
        }
      }
    },
  }
}

export const ImplReact = {
  init,
}
