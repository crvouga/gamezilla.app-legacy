import { createElement, Fragment } from 'react'
import { Pressable, Text, View } from 'react-native'
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  LinearGradient,
  Mask,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg'
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
          return createElement(Svg, props, ...children) as any
        }
        case SVG_TEXT_TAG: {
          return createElement(SvgText, props, ...children) as any
        }
        case CIRCLE_TAG: {
          return createElement(Circle, props, ...children) as any
        }
        case RECT_TAG: {
          return createElement(Rect, props, ...children) as any
        }
        case LINE_TAG: {
          return createElement(Line, props, ...children) as any
        }
        case LINEAR_GRADIENT_TAG: {
          return createElement(LinearGradient, props, ...children) as any
        }
        case RADIAL_GRADIENT_TAG: {
          return createElement(RadialGradient, props, ...children) as any
        }
        case MASK_TAG: {
          return createElement(Mask, props, ...children) as any
        }
        case PATH_TAG: {
          return createElement(Path, props, ...children) as any
        }
        case PATTERN_TAG: {
          return createElement(Pattern, props, ...children) as any
        }
        case STOP_TAG: {
          return createElement(Stop, props, ...children) as any
        }
        case DEFS_TAG: {
          return createElement(Defs, props, ...children) as any
        }
        case G_TAG: {
          return createElement(G, props, ...children) as any
        }
        case CLIP_PATH_TAG: {
          return createElement(ClipPath, props, ...children) as any
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
