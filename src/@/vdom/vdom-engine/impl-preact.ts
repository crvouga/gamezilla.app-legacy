import { Fragment, render } from 'preact'
import { createElement } from 'preact/compat'
import { FRAGMENT_TAG } from '../primitives/frag'
import { IVirtualDomEngine } from './interface'

export type ImplPreact = {
  t: 'preact'
}

const init = (_config: ImplPreact): IVirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom as any, node)
    },
    createElement: (tag: any, props: any, children: any) => {
      children = Array.isArray(children) ? children : children ? [children] : []

      if (tag === FRAGMENT_TAG) {
        return createElement(Fragment, props, ...children) as any
      }

      return createElement(tag, props, ...children) as any
    },
  }
}

export const ImplPreact = {
  init,
}
