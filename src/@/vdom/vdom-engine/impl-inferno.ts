import { Fragment, render } from 'inferno'
import { createElement } from 'inferno-create-element'
import { FRAGMENT_TAG } from '../primitives/frag'
import { IVirtualDomEngine } from './interface'

export type ImplInferno = {
  t: 'inferno'
}

const init = (_config: ImplInferno): IVirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom, node)
    },
    createElement: (tag: any, props: any, children: any) => {
      switch (tag) {
        case FRAGMENT_TAG: {
          return createElement(Fragment, props, children) as any
        }
        default: {
          return createElement(tag, props, children) as any
        }
      }
    },
  }
}

export const ImplInferno = {
  init,
}
