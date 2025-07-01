import { h } from '~/@/vdom/h'
import { cn } from './cn'

export const Spinner = (props: { class?: string }) => {
  return h('div', {
    class: `animate-spin rounded-full border-2 border-neutral-600 border-t-blue-500 ${props.class ?? ''}`,
  })
}

export const SpinnerBlock = (props: { class?: string }) => {
  return h(
    'div',
    {
      class: cn('flex h-full w-full items-center justify-center', props.class),
    },
    [h(Spinner, { class: props.class })],
  )
}
