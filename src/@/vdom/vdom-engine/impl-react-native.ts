import { cssInterop } from 'nativewind'
import { createElement, Fragment } from 'react'
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
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
import { ensureArray } from '~/@/array/ensure-array'
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
  SAFE_AREA_BOX_TAG,
  SCROLL_BOX_TAG,
  STOP_TAG,
  SVG_TAG,
  SVG_TEXT_TAG,
  TEXT_INPUT_TAG,
  TEXT_TAG,
  TRANSITION_ELEMENT_TAG,
} from '../tags'
import { IVirtualDomEngine } from './interface'
import { inPlaceMapPropsToReactNativeProps } from './react-native/map-props-to-react-native-props'
import { inPlaceMapPropsToReactProps } from './react/map-props-to-react-props'
import { ReactNativeCanvas } from './react-native/react-native-canvas'

cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      width: true,
      height: true,
      stroke: true,
      fill: true,
    },
  },
})

cssInterop(Circle, {
  className: {
    target: true,
    nativeStyleToProp: {
      stroke: true,
      fill: true,
    },
  },
})

cssInterop(Rect, {
  className: {
    target: true,
    nativeStyleToProp: {
      width: true,
      height: true,
      stroke: true,
      fill: true,
    },
  },
})

cssInterop(Line, {
  className: {
    target: true,
    nativeStyleToProp: { stroke: true },
  },
})

cssInterop(Path, {
  className: {
    target: true,
    nativeStyleToProp: {
      stroke: true,
      fill: true,
    },
  },
})

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})
const ALLOWED_PROPS = new Set([
  'style',
  'onPress',
  'onLongPress',
  'onPressIn',
  'onPressOut',
  'onStartShouldSetResponder',
  'onResponderMove',
  'onTouchMove',
  'onLayout',
  'disabled',
  'testID',
  'accessibilityLabel',
  'accessibilityRole',
  'accessibilityState',
  'accessibilityHint',
  'children',
  'class',
  'className',
  'role',
  'viewBox',
  'width',
  'height',
  'd',
  'cx',
  'cy',
  'r',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'fill',
  'stroke',
  'strokeWidth',
  'id',
  'patternUnits',
  'patternContentUnits',
  'preserveAspectRatio',
  'viewBox',
  'width',
  'height',
  'd',
  'points',
  'points',
])

const sanitizeProps = (props: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    // Skip non-allowed props
    if (!ALLOWED_PROPS.has(key)) continue

    // Convert string booleans to actual booleans
    if (value === 'true') {
      sanitized[key] = true
      continue
    }
    if (value === 'false') {
      sanitized[key] = false
      continue
    }

    // Map ARIA attributes
    if (key.startsWith('aria-')) {
      const ariaKey = key.replace('aria-', '')
      if (!sanitized.accessibilityState) {
        sanitized.accessibilityState = {}
      }
      sanitized.accessibilityState[ariaKey] = value
      continue
    }

    // Map role to accessibilityRole
    if (key === 'role') {
      sanitized.accessibilityRole = value
      continue
    }

    // Pass through allowed props
    sanitized[key] = value
  }

  return sanitized
}

export type ImplReactNative = {
  t: 'react-native'
}

const init = (_config: ImplReactNative): IVirtualDomEngine => {
  return {
    render: (_vDom, _node) => {
      return createElement(Text, {}, ['Not implemented'])
    },
    createElement: (tag: any, props: any, children: any) => {
      inPlaceMapPropsToReactNativeProps(props)
      inPlaceMapPropsToReactProps(props, tag)

      switch (tag) {
        case PRESSABLE_TAG:
        case BOX_TAG:
        case TEXT_TAG:
        case TEXT_INPUT_TAG:
          props = sanitizeProps(props)
          break
        default:
          break
      }

      children = ensureArray(children)

      switch (tag) {
        case PRESSABLE_TAG:
          return createElement(Pressable, props, ...children) as any
        case SCROLL_BOX_TAG:
          return createElement(ScrollView, props, ...children) as any
        case SAFE_AREA_BOX_TAG:
          return createElement(SafeAreaView, props, ...children) as any
        case BOX_TAG:
          return createElement(View, props, ...children) as any
        case TEXT_TAG:
          return createElement(Text, props, ...children) as any
        case TEXT_INPUT_TAG:
          return createElement(TextInput, props, ...children) as any
        case IMAGE_TAG:
          return createElement(Image, props, ...children) as any
        case CANVAS_TAG:
          return createElement(ReactNativeCanvas as any, props, ...children) as any
        case SVG_TAG:
          return createElement(Svg, props, ...children) as any
        case SVG_TEXT_TAG:
          return createElement(SvgText, props, ...children) as any
        case CIRCLE_TAG:
          return createElement(Circle, props, ...children) as any
        case RECT_TAG:
          return createElement(Rect, props, ...children) as any
        case LINE_TAG:
          return createElement(Line, props, ...children) as any
        case LINEAR_GRADIENT_TAG:
          return createElement(LinearGradient, props, ...children) as any
        case RADIAL_GRADIENT_TAG:
          return createElement(RadialGradient, props, ...children) as any
        case MASK_TAG:
          return createElement(Mask, props, ...children) as any
        case PATH_TAG:
          return createElement(Path, props, ...children) as any
        case PATTERN_TAG:
          return createElement(Pattern, props, ...children) as any
        case STOP_TAG:
          return createElement(Stop, props, ...children) as any
        case DEFS_TAG:
          return createElement(Defs, props, ...children) as any
        case G_TAG:
          return createElement(G, props, ...children) as any
        case CLIP_PATH_TAG:
          return createElement(ClipPath, props, ...children) as any
        case FRAGMENT_TAG:
          return createElement(Fragment, props, ...children) as any
        case TRANSITION_ELEMENT_TAG:
          return createElement(View, props, ...children) as any
        default:
          return createElement(tag, props, ...children) as any
      }
    },
  }
}

export const ImplReactNative = {
  init,
}
