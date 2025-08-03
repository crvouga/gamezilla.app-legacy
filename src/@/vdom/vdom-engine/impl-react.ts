import { createElement, Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ensureArray } from '~/@/array/ensure-array'
import { CANVAS_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'

import { inPlaceMapPropsToReactProps } from './react/map-props-to-react-props'
import { inPlaceMapPropsToWebProps } from './web/map-props-to-web-props'
import { WebCanvas } from './web/web-canvas'
import { WebSafeAreaBox } from './web/web-safe-area-box'
import { WebScrollBox } from './web/web-scroll-box'

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
    createElement: (tag: any, props: any, children: any) => {
      inPlaceMapPropsToWebProps(props)
      inPlaceMapPropsToReactProps(props, tag)

      children = ensureArray(children)
      switch (tag) {
        case FRAGMENT_TAG:
          return createElement(Fragment, props, ...children) as any
        case SCROLL_BOX_TAG:
          return createElement(WebScrollBox as any, props, ...children) as any
        case SAFE_AREA_BOX_TAG:
          return createElement(WebSafeAreaBox as any, props, ...children) as any
        case CANVAS_TAG:
          return createElement(WebCanvas as any, props, ...children) as any
        default:
          return createElement(tag, props, ...children) as any
      }
    },
  }
}

export const ImplReact = {
  init,
}
