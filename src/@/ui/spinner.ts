import { v } from '~/@/vdom/v'
import { cn } from './cn'

export const Spinner = (props: { class?: string }) => {
  return v('div', {
    class: `animate-spin rounded-full border-2 border-neutral-600 border-t-blue-500 ${props.class ?? ''}`,
  })
}

export const SpinnerBlock = (props: { class?: string }) => {
  return v(
    'div',
    {
      class: cn('flex h-full w-full items-center justify-center', props.class),
    },
    [v(Spinner, { class: props.class })],
  )
}
