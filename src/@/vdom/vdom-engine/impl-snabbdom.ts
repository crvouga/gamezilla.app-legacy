import { attributesModule, eventListenersModule, fragment, init, propsModule, styleModule } from 'snabbdom'
import { inPlaceFlatTruthyArray } from '~/@/array/in-place-flat-truthy-array'
import { inPlaceMapKeys } from '~/@/object/in-place-map-keys'
import { kebabToCamel } from '~/@/string/kebab-to-camel'
import { CANVAS_TAG, FRAGMENT_TAG, SAFE_AREA_BOX_TAG, SCROLL_BOX_TAG } from '../tags'
import { IVirtualDomEngine } from './interface'
import { createPrimitiveElement } from './snabbdom/snabbdom-create-element'
import { inPlaceMapPropsToWebProps } from './web/map-props-to-web-props'
import { WebCanvas } from './web/web-canvas'
import { WebSafeAreaBox } from './web/web-safe-area-box'
import { WebScrollBox } from './web/web-scroll-box'

export type ImplSnabbdom = {
  t: 'snabbdom'
}

const init_ = (_config: ImplSnabbdom): IVirtualDomEngine => {
  const patch = init([styleModule, attributesModule, propsModule, eventListenersModule], undefined, {
    experimental: {
      fragments: true,
    },
  })

  const createElement = (tag: any, props: any, children: any): any => {
    try {
      if (typeof tag === 'function') {
        props.children = children
        return tag(props)
      }
      children = inPlaceFlatTruthyArray(children ?? props?.children)
      inPlaceMapPropsToWebProps(props)
      inPlaceMapKeys(props.style, kebabToCamel)
      switch (tag) {
        case FRAGMENT_TAG:
          return fragment(children)
        case SAFE_AREA_BOX_TAG:
          return createElement(WebSafeAreaBox as any, props, children) as any
        case SCROLL_BOX_TAG:
          return createElement(WebScrollBox as any, props, children) as any
        case CANVAS_TAG:
          return createElement(WebCanvas as any, props, children) as any
        default:
          return createPrimitiveElement(tag, props, children)
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  let oldVNode: any | null = null
  return {
    render: (vDom, node) => {
      try {
        oldVNode = patch(oldVNode ?? node, vDom as any)
      } catch (e) {
        document.body.innerHTML = ''
        document.body.appendChild(node)
        oldVNode = patch(node, vDom as any)
        console.error(e)
      }
    },
    createElement,
  }
}

export const ImplSnabbdom = {
  init: init_,
}
