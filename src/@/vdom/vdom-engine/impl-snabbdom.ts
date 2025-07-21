import {
  Attrs,
  On,
  attributesModule,
  eventListenersModule,
  fragment,
  h,
  init,
  propsModule,
  styleModule,
} from 'snabbdom'
import { VDOM_FRAGMENT_KEY } from '../fragment'
import { IVirtualDomEngine } from './interface'

// Reusable objects to reduce allocations
let reusableAttrs: Attrs = {}
let reusableOn: On = {}

export type ImplSnabbdom = {
  t: 'snabbdom'
}

const init_ = (_config: ImplSnabbdom): IVirtualDomEngine => {
  const patch = init([styleModule, attributesModule, propsModule, eventListenersModule], undefined, {
    experimental: {
      fragments: true,
    },
  })

  let oldVNode: any | null = null

  return {
    render: (vDom, node) => {
      try {
        oldVNode = patch(oldVNode ?? node, vDom as any)
      } catch (e) {
        document.body.innerHTML = ''
        document.body.appendChild(node)
        oldVNode = null
        oldVNode = patch(oldVNode ?? node, vDom as any)
        console.error(e)
      }
    },
    createPortal: (vDom, _container) => {
      return vDom
    },
    createElement: (tag: any, props: any, children: any) => {
      try {
        children = processChildren(children ?? props?.children)

        if (typeof tag === 'function') {
          return tag({ ...props, key: props?.key, children })
        }

        if (tag === VDOM_FRAGMENT_KEY) {
          return fragment(children)
        }

        // Clear reusable objects
        reusableAttrs = {}
        reusableOn = {}

        let hasAttrs = false
        let hasEvents = false

        // Single pass through props with early optimizations
        if (props) {
          const propKeys = Object.keys(props)
          for (let i = 0; i < propKeys.length; i++) {
            const propKey = propKeys[i]!
            const propValue = props[propKey]

            // Skip undefined/null values
            if (propValue == null || propValue === undefined) continue

            if (propKey.startsWith('on')) {
              reusableOn[getEventName(propKey)] = propValue
              hasEvents = true
            } else if (propKey !== 'children' && propKey !== 'key' && propKey !== 'style') {
              reusableAttrs[propKey] = propValue
              hasAttrs = true
            }
          }
        }

        const vDomProps: any = {}
        if (hasAttrs) vDomProps.attrs = reusableAttrs
        if (hasEvents) vDomProps.on = reusableOn
        if (props?.key !== undefined) vDomProps.key = props.key
        if (props?.style !== undefined) vDomProps.style = props.style

        return h(tag, vDomProps, children)
      } catch (e) {
        // console.error(e)
        return null
      }
    },
  }
}

export const ImplSnabbdom = {
  init: init_,
}

// Cache for event name transformations to avoid repeated string operations
const eventNameCache = new Map<string, string>()
const getEventName = (propKey: string): string => {
  let eventName = eventNameCache.get(propKey)
  if (eventName === undefined) {
    eventName = propKey.slice(2).toLowerCase()
    eventNameCache.set(propKey, eventName)
  }
  return eventName
}

const processChildren = (children: any): any[] => {
  if (!children) return []
  if (!Array.isArray(children)) return [children]

  // Check if flattening is needed
  let needsFlattening = false
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      needsFlattening = true
      break
    }
  }

  let processedChildren = needsFlattening ? children.flat(Infinity) : children

  // Only filter if there are falsy values
  let hasFalsyValues = false
  for (let i = 0; i < processedChildren.length; i++) {
    if (!processedChildren[i]) {
      hasFalsyValues = true
      break
    }
  }

  if (hasFalsyValues) {
    return processedChildren.filter(Boolean)
  }

  return processedChildren
}
