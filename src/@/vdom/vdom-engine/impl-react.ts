import { createElement, Fragment, StrictMode } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { ensureArray } from '~/@/array/ensure-array'
import { inPlaceMapKeys } from '~/@/object/in-place-map-keys'
import { kebabToCamel } from '~/@/string/kebab-to-camel'
import { PORTAL_ENTRANCE_TAG } from '../primitives/portal'
import { CANVAS_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { mapPropsToWebProps } from './web/map-props-to-web-props'
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
      inPlaceMapKeys(props?.style, kebabToCamel)
      props = mapPropsToWebProps(props)

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
        case PORTAL_ENTRANCE_TAG:
          return createPortal(createElement(Fragment, props, ...children), document.body)
        default:
          return createElement(tag, props, ...children) as any
      }
    },
  }
}

export const ImplReact = {
  init,
}
