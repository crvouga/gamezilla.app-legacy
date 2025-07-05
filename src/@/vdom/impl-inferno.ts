import { createPortal, Fragment, render } from 'inferno'
import { createElement } from 'inferno-create-element'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'

export const initInferno = (): VirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom, node)
    },
    createPortal: (vDom, container) => {
      return createPortal(vDom, container) as any
    },
    createElement: (tag: any, props: any, children: any) => {
      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, children) as any
      }
      return createElement(tag, props, children) as any
    },
  }
}
