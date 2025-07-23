import { createElement, Fragment } from 'react'
import { CANVAS_TAG } from '../primitives/canvas'
import { FRAGMENT_TAG } from '../primitives/frag'
import { IMAGE_TAG } from '../primitives/image'
import { CIRCLE_TAG } from '../primitives/svg/circle'
import { CLIP_PATH_TAG } from '../primitives/svg/clip-path'
import { DEFS_TAG } from '../primitives/svg/defs'
import { G_TAG } from '../primitives/svg/g'
import { LINE_TAG } from '../primitives/svg/line'
import { LINEAR_GRADIENT_TAG } from '../primitives/svg/linear-gradient'
import { MASK_TAG } from '../primitives/svg/mask'
import { PATH_TAG } from '../primitives/svg/path'
import { PATTERN_TAG } from '../primitives/svg/pattern'
import { RADIAL_GRADIENT_TAG } from '../primitives/svg/radial-gradient'
import { RECT_TAG } from '../primitives/svg/rect'
import { STOP_TAG } from '../primitives/svg/stop'
import { SVG_TAG } from '../primitives/svg/svg'
import { SVG_TEXT_TAG } from '../primitives/svg/text'
import { TEXT_TAG } from '../primitives/text'
import { TEXT_INPUT_TAG } from '../primitives/text-input'
import { PRESSABLE_TAG } from '../primitives/pressable'
import { IVirtualDomEngine } from './interface'
import { normalizeChildren, normalizePropsInPlace } from './react'

export type ImplReactNative = {
  t: 'react-native'
}

const init = (_config: ImplReactNative): IVirtualDomEngine => {
  return {
    render: (_vDom, _node) => {
      throw new Error('Not implemented')
    },
    createElement: (tag: any, props: any, children: any) => {
      normalizePropsInPlace(props, tag)
      children = normalizeChildren(children)

      switch (tag) {
        case PRESSABLE_TAG: {
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
        case SVG_TAG: {
          throw new Error('Not implemented')
        }
        case SVG_TEXT_TAG: {
          throw new Error('Not implemented')
        }
        case CIRCLE_TAG: {
          throw new Error('Not implemented')
        }
        case RECT_TAG: {
          throw new Error('Not implemented')
        }
        case LINE_TAG: {
          throw new Error('Not implemented')
        }
        case LINEAR_GRADIENT_TAG: {
          throw new Error('Not implemented')
        }
        case RADIAL_GRADIENT_TAG: {
          throw new Error('Not implemented')
        }
        case MASK_TAG: {
          throw new Error('Not implemented')
        }
        case PATH_TAG: {
          throw new Error('Not implemented')
        }
        case PATTERN_TAG: {
          throw new Error('Not implemented')
        }
        case STOP_TAG: {
          throw new Error('Not implemented')
        }
        case DEFS_TAG: {
          throw new Error('Not implemented')
        }
        case G_TAG: {
          throw new Error('Not implemented')
        }
        case CLIP_PATH_TAG: {
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
