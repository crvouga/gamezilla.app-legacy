import { v } from '~/@/vdom/v'
import { cn } from './cn'

export const Spinner = (props: { className?: string }) => {
  return v('div', {
    className: `animate-spin rounded-full border-2 border-neutral-600 border-t-blue-500 ${props.className ?? ''}`,
  })
}

export const SpinnerBlock = (props: { className?: string }) => {
  return v(
    'div',
    {
      className: cn('flex h-full w-full items-center justify-center', props.className),
    },
    [v(Spinner, { className: props.className })],
  )
}
