// @ts-nocheck
import { Fragment, render } from 'preact'
import { createElement } from 'preact/compat'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'

export const initPreact = (): VirtualDomEngine => {
  return {
    createPortal: (vDom, container) => {
      render(vDom, container)
      return createElement(Fragment, {})
    },
    render: (node) => (vDom) => render(vDom, node),
    createElement: (tag, props, children = []) => {
      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, ...children)
      }
      return createElement(tag, props, ...children)
    },
  }
}
