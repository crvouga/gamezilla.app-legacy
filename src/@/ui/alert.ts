import type { VDom } from '~/@/vdom/vdom'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import { IconCheckmarkCircle, IconExclamationCircle, IconInfoCircle } from './icon'
import { cn } from './cn'

export const AlertError = ({ class: class_, text }: { text?: string; class?: string }) => {
  return h(
    Box,
    {
      role: 'alert',
      'aria-label': text,
      class: cn('flex w-full items-center rounded-md bg-red-500 p-4 text-white', class_),
    },
    [h(Box, { class: 'mr-2' }, [h(IconExclamationCircle, { class: 'size-6' })]), text],
  )
}

export const AlertInfo = ({ children, class: class_ }: { children?: VDom; class?: string }) => {
  return h(Box, { class: cn(class_, 'flex w-full items-center rounded-md bg-blue-500 p-4 text-white') }, [
    h(Box, { class: 'mr-2' }, [h(IconInfoCircle, { class: 'size-6' })]),
    children,
  ])
}

export const AlertSuccess = ({ children, class: class_ }: { children?: VDom; class?: string }) => {
  return h(Box, { class: cn(class_, 'flex w-full items-center rounded-md bg-green-500 p-4 text-white') }, [
    h(Box, { class: 'mr-2' }, [h(IconCheckmarkCircle, { class: 'size-6' })]),
    children,
  ])
}
