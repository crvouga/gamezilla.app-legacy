import { h } from '~/@/vdom/h'

type LoadingBarInput = {
  disabled?: boolean
  className?: string
  color?: string
  backgroundColor?: string
}

export const LoadingBar = (input: LoadingBarInput) => {
  return h('div', { className: 'relative h-2 overflow-hidden bg-transparent' }, [
    !input.disabled && h('div', { className: 'absolute h-full w-1/2 rounded-full bg-blue-500' }),
  ])
}
