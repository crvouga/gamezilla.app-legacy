import { createElement, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { kebabObjectToCamelObject } from './style'

export const initReact = (): VirtualDomEngine => {
  return {
    render: (node) => {
      const reactRoot = createRoot(node)
      return (vDom) => {
        reactRoot.render(vDom as any)
      }
    },
    createPortal: (vDom, container) => {
      const portal = createPortal(vDom as any, container)
      return portal
    },
    createElement: (tag: any, props: any, children: any) => {
      if (props?.style) {
        props.style = kebabObjectToCamelObject(props?.style)
      }

      if (typeof tag === 'string' && props?.class) {
        props.className = props.class
        delete props.class
      }

      children = Array.isArray(children) ? children : children ? [children] : []

      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, ...children) as any
      }

      return createElement(tag, props, ...children) as any
    },
  }
}
