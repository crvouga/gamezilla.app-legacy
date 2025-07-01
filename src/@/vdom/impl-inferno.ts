import { createPortal, Fragment, ParentDOM, render } from 'inferno'
import { createElement } from 'inferno-create-element'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { ICreatePortal, VirtualDomEngine } from './interface'
import { VDom } from './vdom'

export const initInferno = (): VirtualDomEngine => {
  return {
    render: (node) => {
      return (vDom) => {
        render(vDom, node as unknown as ParentDOM)
      }
    },
    createPortal: createPortal as ICreatePortal,
    v: (tag: any, props: any, children) => {
      if (tag === VDOM_FRAGMENT_KEY) {
        return createElement(Fragment, props, ...(children ?? [])) as VDom
      }
      return createElement(tag, props, ...(children ?? [])) as VDom
    },
  }
}
