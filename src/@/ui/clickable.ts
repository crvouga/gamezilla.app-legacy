import { h } from '~/@/vdom/h'
import { PrimitiveProps } from '../vdom/primitive-props'
import { Pressable } from '../vdom/primitives/pressable'
import { cn } from './cn'
import { PAPER_CLASS_NAME } from './paper'

export const Clickable = (props: PrimitiveProps) => {
  return h(
    Pressable,
    {
      ...props,
      class: cn(
        'touch-manipulation enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 enabled:active:opacity-75',
        props.class,
      ),
    },
    props.children ?? [],
  )
}

export const ClickableTransparent = (input: PrimitiveProps) => {
  return h(
    Clickable,
    {
      ...input,
      class: cn('[@media(hover:hover)]:enabled:hover:bg-neutral-700/50', input.class),
    },
    input.children,
  )
}

export const ClickablePaper = (input: PrimitiveProps) => {
  return h(
    Clickable,
    {
      ...input,
      class: cn(PAPER_CLASS_NAME, '[@media(hover:hover)]:enabled:hover:bg-neutral-800', input.class),
    },
    input.children ?? [],
  )
}
