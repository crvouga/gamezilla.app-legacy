import {
  Attrs,
  On,
  VNode,
  classModule,
  eventListenersModule,
  fragment,
  h,
  init,
  propsModule,
  styleModule,
} from 'snabbdom'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { VDom } from './vdom'
import { kebabObjectToCamelObject } from './style'

export const initSnabbdom = (): VirtualDomEngine => {
  const patch = init([classModule, propsModule, styleModule, eventListenersModule])

  return {
    render: (node) => {
      let oldVNode: VNode | Element = node
      let isFirstRender = true
      return (newVNode) => {
        if (isFirstRender) {
          // For the first render, patch the DOM node directly
          oldVNode = patch(oldVNode as Element, newVNode as VNode)
          isFirstRender = false
        } else {
          // For subsequent renders, patch VNode to VNode
          oldVNode = patch(oldVNode as VNode, newVNode as VNode)
        }
      }
    },
    createPortal: (vDom, container) => {
      // Snabbdom doesn't have built-in portal support like React
      // We'll manually render the vDom to the container
      const portalPatch = init([classModule, propsModule, styleModule, eventListenersModule])
      portalPatch(container, vDom as VNode)
      return vDom
    },
    createElement(tag: any, props: any, childrenUncleaned: any) {
      const children = cleanChildren(childrenUncleaned ?? [])

      if (tag === VDOM_FRAGMENT_KEY) {
        const vDom: VDom = fragment(children.flat(Infinity))
        return vDom
      }

      if (typeof tag === 'function') {
        const vDom = tag({ ...props, children })
        return vDom
      }

      const { attrs, on, style, className } = toSnabbdomProps(props)

      const snabbdomProps: any = { attrs, on }

      // Handle style
      if (style) {
        snabbdomProps.style = style
      }

      // Handle class
      if (className) {
        snabbdomProps.class = className
      }

      const vDom = h(tag, snabbdomProps, children)

      return vDom
    },
  }
}

const toSnabbdomProps = (props: any): { attrs: Attrs; on: On; style?: any; className?: any } => {
  const attrs: Attrs = {}
  const on: On = {}
  let style: any = undefined
  let className: any = undefined

  for (const key in props) {
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase()
      on[eventName] = props[key]
    } else if (key === 'style') {
      // Convert kebab-case style properties to camelCase if needed
      style = typeof props[key] === 'object' ? kebabObjectToCamelObject(props[key]) : props[key]
    } else if (key === 'class' || key === 'className') {
      // Convert className string to Snabbdom class object format
      className = convertClassNameToSnabbdomFormat(props[key])
    } else if (key !== 'children') {
      attrs[key] = props[key]
    }
  }

  return { attrs, on, style, className }
}

const convertClassNameToSnabbdomFormat = (className: any): any => {
  if (!className) return undefined

  if (typeof className === 'string') {
    // Split string by spaces and create object with each class as key with true value
    const classObj: { [key: string]: boolean } = {}
    className.split(/\s+/).forEach((cls: string) => {
      if (cls.trim()) {
        classObj[cls.trim()] = true
      }
    })
    return classObj
  } else if (typeof className === 'object') {
    // Already in object format, return as-is
    return className
  }

  return undefined
}

const cleanChildren = (dirty: any[]): any[] => {
  const cleaned: VNode[] = []

  for (const c of (dirty ?? []).flat(Infinity)) {
    if (typeof c === 'string') {
      cleaned.push(c as unknown as VNode)
    }
    if (typeof c === 'object' && c !== null) {
      cleaned.push(c)
    }
  }

  return cleaned
}
