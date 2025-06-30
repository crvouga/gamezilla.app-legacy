import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { IconCheckmarkCircle, IconExclamationCircle, IconInfoCircle } from './icon'
import { cn } from './cn'

export const AlertError = ({ className, text }: { text?: string; className?: string }) => {
  return h(
    'div',
    {
      role: 'alert',
      'aria-label': text,
      className: cn('flex w-full items-center rounded-md bg-red-500 p-4 text-white', className),
    },
    [h('div', { className: 'mr-2' }, [h(IconExclamationCircle, { className: 'size-6' })]), text],
  )
}

export const AlertInfo = ({ children, className }: { children?: VDom; className?: string }) => {
  return h('div', { className: cn(className, 'flex w-full items-center rounded-md bg-blue-500 p-4 text-white') }, [
    h('div', { className: 'mr-2' }, [h(IconInfoCircle, { className: 'size-6' })]),
    children,
  ])
}

export const AlertSuccess = ({ children, className }: { children?: VDom; className?: string }) => {
  return h('div', { className: cn(className, 'flex w-full items-center rounded-md bg-green-500 p-4 text-white') }, [
    h('div', { className: 'mr-2' }, [h(IconCheckmarkCircle, { className: 'size-6' })]),
    children,
  ])
}
