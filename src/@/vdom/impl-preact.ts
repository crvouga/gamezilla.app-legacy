import { Fragment, render } from 'preact'
import { createElement, createPortal } from 'preact/compat'
import { ICreatePortal, VirtualDomEngine } from './interface'
import { VDom } from './vdom'

export const initPreact = (): VirtualDomEngine => {
  return {
    render: (node) => {
      return (vDom) => {
        render(vDom, node)
      }
    },
    createPortal: createPortal as ICreatePortal,
    v: (tag, props, children) => {
      if (tag === 'fragment') {
        return createElement(Fragment, props ?? null, ...(children ?? [])) as VDom
      }
      return createElement(tag, props ?? null, ...(children ?? [])) as VDom
    },
  }
}
