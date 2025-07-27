import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { ClickableTransparent } from './clickable'
import { cn } from './cn'

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const IconButton = (input: {
  onPress?: (event: unknown) => void
  label: TranslatedText
  renderIcon: (input: { class: string; fill: string; stroke: string }) => VDom
  class?: string
  size?: IconButtonSize
  dataTestId?: string
  ariaLabel?: TranslatedText
}) => {
  return h(
    ClickableTransparent,
    {
      class: cn(
        'display flex flex-row items-center justify-center overflow-hidden rounded-full',
        toSizeClassName(input.size ?? 'md'),
        input.class,
      ),
      onPress: input.onPress,
      'aria-label': input.ariaLabel ?? input.label,
      'data-testid': input.dataTestId,
      role: 'button',
    },
    [
      input.renderIcon({
        class: 'w-full h-full cursor-pointer',
        fill: 'white',
        stroke: 'white',
      }),
    ],
  )
}

export const IconButtonEmpty = (input: { size?: IconButtonSize }) => {
  return h(Box, { class: toSizeClassName(input.size ?? 'md') })
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
