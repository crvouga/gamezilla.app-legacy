import { Attrs, On, h } from 'snabbdom'
import { propKeyToEventName } from '../web/prop-key-to-event-name'

const isSpecialKey = (key: string) => key === 'children' || key === 'key' || key === 'style'

export const createElement = (tag: string, props: any, children: any) => {
  const attrs: Attrs = {}
  const on: On = {}
  let hasAttrs = false
  let hasEvents = false

  if (props) {
    for (const propKey in props) {
      const propValue = props[propKey]

      if (propValue == null || propValue === undefined) continue

      if (propKey.startsWith('on')) {
        on[propKeyToEventName(propKey)] = propValue
        hasEvents = true
      } else if (!isSpecialKey(propKey)) {
        attrs[propKey] = propValue
        hasAttrs = true
      }
    }
  }

  const snabbdomProps: Record<string, unknown> = {}
  if (hasAttrs) snabbdomProps.attrs = attrs
  if (hasEvents) snabbdomProps.on = on
  if (props?.key) snabbdomProps.key = props.key
  if (props?.style) snabbdomProps.style = props.style

  return h(tag, snabbdomProps, children)
}
