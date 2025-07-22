import { createElement, Fragment } from 'react'
import { FRAGMENT_TAG } from '../primitives/frag'
import { kebabObjectToCamelObject } from '../style'
import { IVirtualDomEngine } from './interface'
import { TOUCHABLE_TAG } from '../primitives/touchable'
import { TEXT_INPUT_TAG } from '../primitives/text-input'
import { TEXT_TAG } from '../primitives/text'
import { IMAGE_TAG } from '../primitives/image'
import { CANVAS_TAG } from '../primitives/canvas'

const propMap = new Map<string, string>()
propMap.set('class', 'className')
propMap.set('stroke-linecap', 'strokeLinecap')
propMap.set('stroke-linejoin', 'strokeLinejoin')
propMap.set('stroke-width', 'strokeWidth')
propMap.set('stroke-opacity', 'strokeOpacity')
propMap.set('clip-rule', 'clipRule')
propMap.set('fill-rule', 'fillRule')
const propMapKeys = Array.from(propMap.keys())

export type ImplReactNative = {
  t: 'react-native'
}

const init = (_config: ImplReactNative): IVirtualDomEngine => {
  return {
    render: (_vDom, _node) => {
      throw new Error('Not implemented')
    },
    createElement: (tag: any, props: any, children: any) => {
      if (props?.style) {
        props.style = kebabObjectToCamelObject(props?.style)
      }

      if (typeof tag === 'string') {
        for (const propKey of propMapKeys) {
          if (propKey in props) {
            props[propMap.get(propKey)!] = props[propKey]
            delete props[propKey]
          }
        }
      }

      children = Array.isArray(children) ? children : children ? [children] : []

      switch (tag) {
        case TOUCHABLE_TAG: {
          throw new Error('Not implemented')
        }
        case TEXT_TAG: {
          throw new Error('Not implemented')
        }
        case TEXT_INPUT_TAG: {
          throw new Error('Not implemented')
        }
        case IMAGE_TAG: {
          throw new Error('Not implemented')
        }
        case CANVAS_TAG: {
          throw new Error('Not implemented')
        }
        case FRAGMENT_TAG: {
          return createElement(Fragment, props, ...children) as any
        }
        default: {
          return createElement(tag, props, ...children) as any
        }
      }
    },
  }
}

export const ImplReact = {
  init,
}
