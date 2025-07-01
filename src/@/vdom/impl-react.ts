import { createElement, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { VDom } from './vdom'
import { ICreatePortal, VirtualDomEngine } from './interface'

export const initReact = (): VirtualDomEngine => {
  return {
    render: (node) => {
      const reactRoot = createRoot(node)
      return (vDom) => {
        reactRoot.render(vDom)
      }
    },
    createPortal: createPortal as ICreatePortal,
    v: (tag, props, children) => {
      if (tag === 'fragment') {
        return createElement(Fragment, props ?? null, ...(children ?? [])) as VDom
      }
      return createElement(tag as any, props ?? null, ...(children ?? [])) as VDom
    },
  }
}
