import { createElement, Fragment, StrictMode } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { kebabObjectToCamelObject } from './style'

const propMap = new Map<string, string>()
propMap.set('class', 'className')
propMap.set('stroke-linecap', 'strokeLinecap')
propMap.set('stroke-linejoin', 'strokeLinejoin')
propMap.set('stroke-width', 'strokeWidth')
propMap.set('stroke-opacity', 'strokeOpacity')
const propMapKeys = Array.from(propMap.keys())

export const initReact = (): VirtualDomEngine => {
  let reactRoot: ReturnType<typeof createRoot> | undefined
  return {
    render: (vDom, node) => {
      reactRoot ??= createRoot(node)
      reactRoot.render(createElement(StrictMode, {}, vDom as any))
    },
    createPortal: (vDom, container) => {
      const portal = createPortal(vDom as any, container)
      return portal
    },
    createElement: (tag: any, props: any, children: any) => {
      if (props?.style) {
        props.style = kebabObjectToCamelObject(props?.style)
      }

      if (typeof tag === 'string') {
        for (const propKey of propMapKeys) {
          if (propKey in props) {
            props[propMap.get(propKey)!] = props[propKey]
            delete props[propKey]
          }
        }
      }

      children = Array.isArray(children) ? children : children ? [children] : []

      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, ...children) as any
      }

      return createElement(tag, props, ...children) as any
    },
  }
}
