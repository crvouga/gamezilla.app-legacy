import { Fragment, render } from 'preact'
import { createElement, createPortal } from 'preact/compat'
import { VDOM_FRAGMENT_KEY } from '../fragment'
import { IVirtualDomEngine } from './interface'

export type ImplPreact = {
  t: 'preact'
}

const init = (_config: ImplPreact): IVirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom as any, node)
    },
    createPortal: (vDom, container) => {
      return createPortal(vDom as any, container) as any
    },
    createElement: (tag: any, props: any, children: any) => {
      children = Array.isArray(children) ? children : children ? [children] : []

      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, ...children) as any
      }

      return createElement(tag, props, ...children) as any
    },
  }
}

export const ImplPreact = {
  init,
}
