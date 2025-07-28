import { Fragment, render } from 'inferno'
import { createElement } from 'inferno-create-element'
import { PrimitiveProps } from '../primitive-props'
import { BOX_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { updateSafeAreaProps, updateScrollBoxProps } from './web'

export type ImplInferno = {
  t: 'inferno'
}

const init = (_config: ImplInferno): IVirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom, node)
    },
    createElement: (tag: any, props: any, children: any) => {
      props = PrimitiveProps.intoWebStandard(props)
      switch (tag) {
        case FRAGMENT_TAG:
          return createElement(Fragment, props, children) as any
        case SCROLL_BOX_TAG:
          updateScrollBoxProps(props)
          return createElement(BOX_TAG, props, children) as any
        case SAFE_AREA_BOX_TAG:
          updateSafeAreaProps(props)
          return createElement(BOX_TAG, props, children) as any
        default:
          return createElement(tag, props, children) as any
      }
    },
  }
}

export const ImplInferno = {
  init,
}
