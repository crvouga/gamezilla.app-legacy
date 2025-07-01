import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { cn } from './cn'
import { ClickableTransparent } from './clickable'

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const IconButton = (input: {
  onClick?: (event: { currentTarget?: EventTarget | null }) => void
  label: TranslatedText
  renderIcon: (input: { class: string }) => VDom
  class?: string
  size?: IconButtonSize
  dataTestId?: string
}) => {
  return h(
    ClickableTransparent,
    {
      class: cn(
        'display flex items-center justify-center overflow-hidden rounded-full',
        toSizeClassName(input.size ?? 'md'),
        input.class,
      ),
      onClick: input.onClick,
      'aria-label': input.label,
      title: input.label,
      dataTestId: input.dataTestId,
      type: 'button',
    },
    [
      input.renderIcon({
        class: 'w-full h-full cursor-pointer',
      }),
    ],
  )
}

export const IconButtonEmpty = (input: { size?: IconButtonSize }) => {
  return h('div', { class: toSizeClassName(input.size ?? 'md') })
}

const toSizeClassName = (size: IconButtonSize): string => {
  switch (size) {
    case 'xs':
      return 'size-7 p-1'
    case 'sm':
      return 'size-8 p-1.5'
    case 'md':
      return 'size-10 p-2'
    case 'lg':
      return 'size-12 p-2.5'
  }
}
