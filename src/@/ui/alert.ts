import type { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'
import { IconCheckmarkCircle, IconExclamationCircle, IconInfoCircle } from './icon'
import { cn } from './cn'

export const AlertError = ({ class: class_, text }: { text?: string; class?: string }) => {
  return v(
    'div',
    {
      role: 'alert',
      'aria-label': text,
      class: cn('flex w-full items-center rounded-md bg-red-500 p-4 text-white', class_),
    },
    [v('div', { class: 'mr-2' }, [v(IconExclamationCircle, { class: 'size-6' })]), text],
  )
}

export const AlertInfo = ({ children, class: class_ }: { children?: VDom; class?: string }) => {
  return v('div', { class: cn(class_, 'flex w-full items-center rounded-md bg-blue-500 p-4 text-white') }, [
    v('div', { class: 'mr-2' }, [v(IconInfoCircle, { class: 'size-6' })]),
    children,
  ])
}

export const AlertSuccess = ({ children, class: class_ }: { children?: VDom; class?: string }) => {
  return v('div', { class: cn(class_, 'flex w-full items-center rounded-md bg-green-500 p-4 text-white') }, [
    v('div', { class: 'mr-2' }, [v(IconCheckmarkCircle, { class: 'size-6' })]),
    children,
  ])
}
