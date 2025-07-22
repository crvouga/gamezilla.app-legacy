import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/box'
import { cn } from './cn'
import { Spinner } from './spinner'

export const SpinnerBlock = (props: { class?: string }) => {
  return h(
    Box,
    {
      class: cn('flex h-full w-full items-center justify-center', props.class),
    },
    [h(Spinner, { class: props.class ?? 'size-20' })],
  )
}
