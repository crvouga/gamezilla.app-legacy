import { createElement, Fragment, StrictMode } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { PrimitiveProps } from '../primitive-props'
import { BOX_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { normalizeChildren, normalizePropsInPlace } from './react'
import { updateSafeAreaProps, updateScrollBoxProps } from './web'

export type ImplReact = {
  t: 'react'
}

const init = (_config: ImplReact): IVirtualDomEngine => {
  let reactRoot: ReturnType<typeof createRoot> | undefined
  return {
    render: (vDom, node) => {
      reactRoot ??= createRoot(node)
      reactRoot.render(createElement(StrictMode, {}, vDom as any))
    },
    // @ts-ignore
    createPortal: (vDom, container) => {
      const portal = createPortal(vDom as any, container)
      return portal
    },
    createElement: (tag: any, props: any, children: any) => {
      props = PrimitiveProps.intoWebStandard(props)
      normalizePropsInPlace(props, tag)
      children = normalizeChildren(children)

      switch (tag) {
        case FRAGMENT_TAG:
          return createElement(Fragment, props, ...children) as any
        case SCROLL_BOX_TAG:
          updateScrollBoxProps(props)
          return createElement(BOX_TAG, props, children) as any
        case SAFE_AREA_BOX_TAG:
          updateSafeAreaProps(props)
          return createElement(BOX_TAG, props, children) as any
        default:
          return createElement(tag, props, ...children) as any
      }
    },
  }
}

export const ImplReact = {
  init,
}
