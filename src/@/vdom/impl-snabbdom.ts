import { Attrs, On, VNode, attributesModule, eventListenersModule, fragment, h, init, propsModule } from 'snabbdom'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'
import { VDom } from './vdom'

export const initSnabbdom = (): VirtualDomEngine => {
  const patch = init([attributesModule, propsModule, eventListenersModule], undefined, {
    experimental: {
      fragments: true,
    },
  })

  return {
    render: (node) => {
      let oldVNode: VNode
      return (newVNode) => {
        try {
          if (!oldVNode) {
            oldVNode = patch(node, newVNode as VNode)
          } else {
            oldVNode = patch(oldVNode, newVNode as VNode)
          }
        } catch (e) {
          console.error(e)
        }
      }
    },
    createPortal: (vDom, _container) => {
      // Ignore portal creation for now
      return vDom
    },
    createElement(tag: any, props: any, childrenUncleaned: any) {
      try {
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

        const snabbdomProps: any = {
          attrs,
          on,
        }

        const vDom = h(tag, snabbdomProps, children)

        return vDom
      } catch (e) {
        console.error(e)
        return h('div', {}, ['errored'])
      }
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
    } else if (key === 'style') {
      const styleString = styleObjectToStyleString(props[key])
      if (styleString) {
        attrs.style = styleString
      }
    } else if (key !== 'children') {
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

const styleObjectToStyleString = (style: any): string => {
  if (!style || typeof style !== 'object') {
    return ''
  }

  return Object.entries(style)
    .flatMap(([key, value]) => {
      if (value === undefined || value === null || value === false || value === '') {
        return []
      }
      return [`${kebabCase(key)}:${value}`]
    })
    .join(';')
}

const kebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}
