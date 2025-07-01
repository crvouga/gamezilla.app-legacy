import type { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'
import { IconCheckmarkCircle, IconExclamationCircle, IconInfoCircle } from './icon'
import { cn } from './cn'

export const AlertError = ({ className, text }: { text?: string; className?: string }) => {
  return v(
    'div',
    {
      role: 'alert',
      'aria-label': text,
      className: cn('flex w-full items-center rounded-md bg-red-500 p-4 text-white', className),
    },
    [v('div', { className: 'mr-2' }, [v(IconExclamationCircle, { className: 'size-6' })]), text],
  )
}

export const AlertInfo = ({ children, className }: { children?: VDom; className?: string }) => {
  return v('div', { className: cn(className, 'flex w-full items-center rounded-md bg-blue-500 p-4 text-white') }, [
    v('div', { className: 'mr-2' }, [v(IconInfoCircle, { className: 'size-6' })]),
    children,
  ])
}

export const AlertSuccess = ({ children, className }: { children?: VDom; className?: string }) => {
  return v('div', { className: cn(className, 'flex w-full items-center rounded-md bg-green-500 p-4 text-white') }, [
    v('div', { className: 'mr-2' }, [v(IconCheckmarkCircle, { className: 'size-6' })]),
    children,
  ])
}
