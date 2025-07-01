import { v } from '~/@/vdom/v'

type LoadingBarInput = {
  disabled?: boolean
  className?: string
  color?: string
  backgroundColor?: string
}

export const LoadingBar = (input: LoadingBarInput) => {
  return v('div', { className: 'relative h-2 overflow-hidden bg-transparent' }, [
    !input.disabled && v('div', { className: 'absolute h-full w-1/2 rounded-full bg-blue-500' }),
  ])
}
