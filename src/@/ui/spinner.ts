import { h } from '~/@/vdom/h'
import { cn } from './cn'

export const Spinner = (props: { className?: string }) => {
  return h('div', {
    className: `animate-spin rounded-full border-2 border-neutral-600 border-t-blue-500 ${props.className ?? ''}`,
  })
}

export const SpinnerBlock = (props: { className?: string }) => {
  return h(
    'div',
    {
      className: cn('flex h-full w-full items-center justify-center', props.className),
    },
    [h(Spinner, { className: props.className })],
  )
}
