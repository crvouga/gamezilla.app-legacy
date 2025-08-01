import { Fragment, render } from 'inferno'
import { createElement } from 'inferno-create-element'
import { PrimitiveProps } from '../primitive-props'
import { camelObjectToKebabObject } from '../style'
import { BOX_TAG, CANVAS_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { updateSafeAreaProps, updateScrollBoxProps } from './web'
import { CanvasWebComponent } from './web/canvas-web-component'

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
      props.style = camelObjectToKebabObject(props.style)
      switch (tag) {
        case FRAGMENT_TAG:
          return createElement(Fragment, props, children) as any
        case SCROLL_BOX_TAG:
          updateScrollBoxProps(props)
          return createElement(BOX_TAG, props, children) as any
        case SAFE_AREA_BOX_TAG:
          updateSafeAreaProps(props)
          return createElement(BOX_TAG, props, children) as any
        case CANVAS_TAG:
          // @ts-expect-error
          return createElement(CanvasWebComponent, props, children) as any
        default:
          return createElement(tag, props, children) as any
      }
    },
  }
}

export const ImplInferno = {
  init,
}
