// @ts-nocheck
import { createElement, Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { kebabObjectToCamelObject } from './style'

export const initReact = (): VirtualDomEngine => {
  return {
    render: (node) => {
      const reactRoot = createRoot(node)
      return (vDom) => {
        reactRoot.render(vDom)
      }
    },
    createPortal: (vDom, container) => {
      render(vDom, container)
      return createElement(Fragment, {})
    },
    v: (tag, props, children = []) => {
      if (props?.style) {
        props.style = kebabObjectToCamelObject(props?.style)
      }

      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, ...children)
      }

      return createElement(tag, props, ...children)
    },
  }
}
