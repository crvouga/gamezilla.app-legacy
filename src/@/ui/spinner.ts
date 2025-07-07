import { h } from '~/@/vdom/h'
import { cn } from './cn'
import { IconSpinner } from './icon'

export const Spinner = (props: { class?: string }) => {
  return h(IconSpinner, {
    class: `animate-spin ${props.class ?? ''}`,
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
