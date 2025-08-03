import { h } from '~/@/vdom/h'
import { PrimitiveProps } from '../vdom/primitive-props'
import { Pressable } from '../vdom/primitives/pressable'

export const Clickable = (props: PrimitiveProps) => {
  return h(Pressable, { ...props, style: props.style }, props.children ?? [])
}

export const ClickableTransparent = (props: PrimitiveProps) => {
  return h(Clickable, { ...props, style: props.style }, props.children)
}

export const ClickablePaper = (props: PrimitiveProps) => {
  return h(Clickable, { ...props, style: props.style }, props.children ?? [])
}
