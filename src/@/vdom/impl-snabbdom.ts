import { Attrs, On, VNode, attributesModule, eventListenersModule, fragment, h, init, propsModule } from 'snabbdom'
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'

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
            oldVNode = patch(node, newVNode as unknown as VNode)
          } else {
            oldVNode = patch(oldVNode, newVNode as unknown as VNode)
          }
        } catch (e) {
          // console.error(e)
        }
      }
    },
    createPortal: (vDom, _container) => {
      return vDom
    },
    createElement: (tag: any, props: any, children: any) => {
      try {
        children = (children ?? props.children ?? []).flat(Infinity)

        for (let i = children.length - 1; i >= 0; i--) {
          if (!children[i]) children.splice(i, 1)
        }

        if (tag === VDOM_FRAGMENT_KEY) {
          return fragment(children)
        }

        if (typeof tag === 'function') {
          return tag({ ...props, children })
        }

        const attrs: Attrs = {}
        const on: On = {}

        for (const propKey in props) {
          if (propKey.startsWith('on')) {
            const eventName = propKey.slice(2).toLowerCase()
            on[eventName] = props[propKey]
            continue
          }

          if (propKey === 'style') {
            const styleString = styleObjectToStyleString(props[propKey])
            if (styleString) {
              attrs.style = styleString
            }
            continue
          }

          if (propKey !== 'children' && propKey !== 'key') {
            attrs[propKey] = props[propKey]
            continue
          }
        }

        if (props.key) {
          console.log('key', props.key)
        }
        const vDom = h(tag, { attrs, on, key: props.key }, children)

        return vDom
      } catch (e) {
        // console.error(e)
      }
    },
  }
}

const styleObjectToStyleString = (style: any): string => {
  if (!style || typeof style !== 'object') return ''

  let result = ''
  for (const [key, value] of Object.entries(style)) {
    if (value != null && value !== false && value !== '') {
      if (result) result += ';'
      result += `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`
    }
  }
  return result
}
