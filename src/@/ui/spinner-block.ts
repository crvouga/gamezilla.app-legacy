import { h } from '~/@/vdom/h'
import { cn } from './cn'
import { Spinner } from './spinner'

export const SpinnerBlock = (props: { class?: string }) => {
  return h(
    'div',
    {
      class: cn('flex h-full w-full items-center justify-center', props.class),
    },
    [h(Spinner, { class: props.class ?? 'size-20' })],
  )
}
