import { v } from '~/@/vdom/v'

type LoadingBarInput = {
  disabled?: boolean
  class?: string
  color?: string
  backgroundColor?: string
}

export const LoadingBar = (input: LoadingBarInput) => {
  return v('div', { class: 'relative h-2 overflow-hidden bg-transparent' }, [
    !input.disabled && v('div', { class: 'absolute h-full w-1/2 rounded-full bg-blue-500' }),
  ])
}
