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
import { VDOM_FRAGMENT_KEY } from './fragment'
import { VirtualDomEngine } from './interface'

export const initSnabbdom = (): VirtualDomEngine => {
  const patch = init([styleModule, attributesModule, propsModule, eventListenersModule], undefined, {
    experimental: {
      fragments: true,
    },
  })

  return {
    render: (node) => {
      let oldVNode: any = node
      return (newVNode) => {
        try {
          oldVNode = patch(oldVNode, newVNode as any)
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

          if (propKey !== 'children' && propKey !== 'key' && propKey !== 'style') {
            attrs[propKey] = props[propKey]
            continue
          }
        }

        const vDom = h(tag, { attrs, on, key: props.key, style: props.style }, children)

        return vDom
      } catch (e) {
        // console.error(e)
      }
    },
  }
}
