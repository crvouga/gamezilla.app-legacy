import { Fragment, render } from 'preact'
import { createElement, createPortal } from 'preact/compat'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { VDom } from './vdom'

export const initPreact = (): VirtualDomEngine => {
  return {
    render: (node) => (vDom) => render(vDom, node),
    createPortal: (vDom, container) => {
      return createPortal(vDom, container) as VDom
    },
    createElement: (tag: any, props: any, children: any) => {
      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, children) as VDom
      }

      return createElement(tag, props, children) as VDom
    },
  }
}
