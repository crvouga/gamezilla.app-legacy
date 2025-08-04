import { Fragment, render } from 'preact'
import { createElement } from 'preact/compat'
import { ensureArray } from '~/@/array/ensure-array'
import { inPlaceMapKeys } from '~/@/object/in-place-map-keys'
import { camelToKebab } from '~/@/string/camel-to-kebab'
import { CANVAS_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { inPlaceMapPropsToWebProps } from './web/map-props-to-web-props'
import { WebCanvas } from './web/web-canvas'
import { WebSafeAreaBox } from './web/web-safe-area-box'
import { WebScrollBox } from './web/web-scroll-box'

export type ImplPreact = {
  t: 'preact'
}

const init = (_config: ImplPreact): IVirtualDomEngine => {
  return {
    render: (vDom, node) => {
      render(vDom as any, node)
    },
    createElement: (tag: any, props: any, children: any) => {
      inPlaceMapKeys(props.style, camelToKebab)
      inPlaceMapPropsToWebProps(props)
      children = ensureArray(children)
      switch (tag) {
        case FRAGMENT_TAG:
          return createElement(Fragment, props, ...children) as any
        case SCROLL_BOX_TAG:
          return createElement(WebScrollBox, props, children) as any
        case SAFE_AREA_BOX_TAG:
          return createElement(WebSafeAreaBox, props, children) as any
        case CANVAS_TAG:
          return createElement(WebCanvas, props, children) as any
        default:
          return createElement(tag, props, ...children) as any
      }
    },
  }
}

export const ImplPreact = {
  init,
}
