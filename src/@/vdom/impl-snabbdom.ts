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

export const initSnabbdom = (): VirtualDomEngine => {
  const patch = init([classModule, propsModule, styleModule, eventListenersModule])

  return {
    render: (node) => {
      let oldVNode: any = node
      return (newVNode) => {
        patch(oldVNode as any, newVNode as any)
        oldVNode = newVNode
        debugger
      }
    },
    createPortal: (vDom, _container) => {
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

      const { attrs, on } = toSnabbdomProps(props)

      const vDom = h(tag, { attrs, on }, children)

      return vDom
    },
  }
}

const toSnabbdomProps = (props: any): { attrs: Attrs; on: On } => {
  const attrs: Attrs = {}
  const on: On = {}
  for (const key in props) {
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase()
      on[eventName] = props[key]
    } else {
      attrs[key] = props[key]
    }
  }

  return { attrs, on }
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
