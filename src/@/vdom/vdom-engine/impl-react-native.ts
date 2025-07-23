import { createElement, Fragment } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  BOX_TAG,
  CANVAS_TAG,
  CIRCLE_TAG,
  CLIP_PATH_TAG,
  DEFS_TAG,
  FRAGMENT_TAG,
  G_TAG,
  IMAGE_TAG,
  LINE_TAG,
  LINEAR_GRADIENT_TAG,
  MASK_TAG,
  PATH_TAG,
  PATTERN_TAG,
  PRESSABLE_TAG,
  RADIAL_GRADIENT_TAG,
  RECT_TAG,
  STOP_TAG,
  SVG_TAG,
  SVG_TEXT_TAG,
  TEXT_INPUT_TAG,
  TEXT_TAG,
} from '../tags'
import { IVirtualDomEngine } from './interface'
import { normalizeChildren, normalizePropsInPlace } from './react'

export type ImplReactNative = {
  t: 'react-native'
}

const init = (_config: ImplReactNative): IVirtualDomEngine => {
  return {
    render: (_vDom, _node) => {
      // throw new Error('Not implemented')
      return createElement(Text, {}, ['Not implemented'])
    },
    createElement: (tag: any, props: any, children: any) => {
      normalizePropsInPlace(props, tag)
      children = normalizeChildren(children)

      switch (tag) {
        case PRESSABLE_TAG: {
          return createElement(Pressable, props, ...children) as any
        }
        case BOX_TAG: {
          return createElement(View, props, ...children) as any
        }
        case TEXT_TAG: {
          return createElement(Text, props, ...children) as any
        }
        case TEXT_INPUT_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case IMAGE_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case CANVAS_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case SVG_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case SVG_TEXT_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case CIRCLE_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case RECT_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case LINE_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case LINEAR_GRADIENT_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case RADIAL_GRADIENT_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case MASK_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case PATH_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case PATTERN_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case STOP_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case DEFS_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case G_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
        }
        case CLIP_PATH_TAG: {
          // throw new Error('Not implemented')
          return createElement(Text, {}, ['Not implemented'])
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

export const ImplReactNative = {
  init,
}
