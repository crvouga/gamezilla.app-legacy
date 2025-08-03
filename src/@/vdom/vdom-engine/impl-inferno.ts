import { Fragment, render } from 'inferno'
import { createElement } from 'inferno-create-element'
import { CANVAS_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { inPlaceMapPropsToWebProps } from './web/map-props-to-web-props'
import { WebCanvas } from './web/web-canvas'
import { WebSafeAreaBox } from './web/web-safe-area-box'
import { WebScrollBox } from './web/web-scroll-box'

export type ImplInferno = {
  t: 'inferno'
}

const init = (_config: ImplInferno): IVirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom, node)
    },
    createElement: (tag: any, props: any, children: any) => {
      inPlaceMapPropsToWebProps(props)

      switch (tag) {
        case FRAGMENT_TAG:
          return createElement(Fragment, props, children) as any
        case SCROLL_BOX_TAG:
          return createElement(WebScrollBox as any, props, children) as any
        case SAFE_AREA_BOX_TAG:
          return createElement(WebSafeAreaBox as any, props, children) as any
        case CANVAS_TAG:
          return createElement(WebCanvas as any, props, children) as any
        default:
          return createElement(tag, props, children) as any
      }
    },
  }
}

export const ImplInferno = {
  init,
}
