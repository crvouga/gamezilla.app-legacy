// @ts-nocheck
import { Fragment, render } from 'inferno'
import { createElement } from 'inferno-create-element'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'

export const initInferno = (): VirtualDomEngine => {
  return {
    render: (node) => (vDom) => render(vDom, node),
    createPortal: (vDom, container) => {
      render(vDom, container)
      return createElement(Fragment, {})
    },
    createElement: (tag, props, children = []) => {
      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, ...children)
      }
      return createElement(tag, props, ...children)
    },
  }
}
