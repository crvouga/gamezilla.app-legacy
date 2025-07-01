// @ts-nocheck

import { Attrs, On, VNode, attributesModule, eventListenersModule, fragment, h, init } from 'snabbdom'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { VDom } from './vdom'

export const initSnabbdom = (): VirtualDomEngine => {
  const patch = init([eventListenersModule, attributesModule])
  return {
    render: (node) => {
      let prevNode: unknown = node
      return (vDom) => {
        try {
          patch(prevNode, vDom)
          prevNode = vDom
        } catch (error) {
          // debugger
        }
      }
    },
    createPortal: (vDom, container) => {
      patch(vDom, container)
      const vDomNew: VDom = fragment([])
      return vDomNew
    },
    v(tag, props, childrenUncleaned) {
      const children = cleanChildren(childrenUncleaned ?? [])

      if (tag === VDOM_FRAGMENT_KEY) {
        const vDom: VDom = fragment(children.flat(Infinity))
        return vDom
      }

      if (typeof tag === 'function') {
        const vDom: VDom = tag({ ...props, children })
        return vDom
      }

      const { attrs, on } = toSnabbdomProps(props)

      const vDom: VDom = h(tag, { attrs, on }, children)

      return vDom
    },
  }
}

const toSnabbdomProps = (props: Props): { attrs: Attrs; on: On } => {
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

const cleanChildren = (dirty: unknown[]): unknown[] => {
  const cleaned: VNode[] = []

  for (const c of (dirty ?? []).flat(Infinity)) {
    if (typeof c === 'string') {
      cleaned.push(c)
    }
    if (typeof c === 'object' && c !== null) {
      cleaned.push(c)
    }
  }

  return cleaned
}
