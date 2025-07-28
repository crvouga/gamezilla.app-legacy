import { Fragment, render } from 'preact'
import { createElement } from 'preact/compat'
import { BOX_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { PrimitiveProps } from '../primitive-props'
import { addSafeAreaPadding } from './web'

export type ImplPreact = {
  t: 'preact'
}

const init = (_config: ImplPreact): IVirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom as any, node)
    },
    createElement: (tag: any, props: any, children: any) => {
      props = PrimitiveProps.intoWebStandard(props)
      children = normalizeChildren(children)

      switch (tag) {
        case FRAGMENT_TAG:
          return createElement(Fragment, props, ...children) as any
        case SCROLL_BOX_TAG:
          return createElement(BOX_TAG, props, children) as any
        case SAFE_AREA_BOX_TAG:
          addSafeAreaPadding(props)
          return createElement(BOX_TAG, props, children) as any
        default:
          return createElement(tag, props, ...children) as any
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
