import { Fragment, render } from 'preact'
import { createElement } from 'preact/compat'
import { FRAGMENT_TAG } from '../tags'
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
      children = normalizeChildren(children)

      switch (tag) {
        case FRAGMENT_TAG: {
          return createElement(Fragment, props, ...children) as any
        }
        default: {
          return createElement(tag, props, ...children) as any
        }
      }
    },
  }
}

const normalizeChildren = (children: unknown) => {
  return Array.isArray(children) ? children : children ? [children] : []
}

export const ImplPreact = {
  init,
}
