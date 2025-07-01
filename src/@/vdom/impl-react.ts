import { createElement, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { ICreatePortal, VirtualDomEngine } from './interface'
import { kebabObjectToCamelObject, StylesObjectKebab } from './style'
import { VDom } from './vdom'

export const initReact = (): VirtualDomEngine => {
  return {
    render: (node) => {
      const reactRoot = createRoot(node)
      return (vDom) => {
        reactRoot.render(vDom)
      }
    },
    createPortal: createPortal as ICreatePortal,
    v: (tag, props, children) => {
      if (props?.style) {
        props.style = kebabObjectToCamelObject(props?.style as StylesObjectKebab)
      }
      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props ?? null, ...(children ?? [])) as VDom
      }
      return createElement(tag as any, props ?? null, ...(children ?? [])) as VDom
    },
  }
}
