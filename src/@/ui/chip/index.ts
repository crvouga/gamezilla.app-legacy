import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { Clickable } from '../clickable'
import { cn } from '../cn'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export type ChipSize = 'sm' | 'lg'

export type ChipProps = {
  renderStartIcon?: (input: { class: string }) => VDom
  label: TranslatedText
  size: ChipSize
  onPressDown?: () => void
}

export const Chip = (input: ChipProps) => {
  return h(
    Tag,
    {
      tagName: typeof input.onPressDown === 'function' ? 'button' : 'div',
      class: cn('flex flex-row items-center gap-1 truncate border border-white/30 font-semibold', toSizeClass(input)),
      onPressDown: input.onPressDown,
    },
    [
      input.renderStartIcon?.({
        class: cn(toIconSizeClass(input), 'shrink-0'),
      }),
      h(Box, { class: 'truncate' }, [Text({ text: input.label })]),
    ],
  )
}

const Tag = ({
  children,
  tagName,
  ...input
}: {
  children: VDom
  tagName: 'div' | 'button'
  onPressDown?: () => void
  class?: string
}) => {
  switch (tagName) {
    case 'button':
      return h(Clickable, input, [children])
    default:
      return h(Box, input, [children])
  }
}

const toSizeClass = (input: ChipProps): string => {
  switch (input.size) {
    case 'sm':
      return 'text-xs px-2 py-1 rounded-xl'
    case 'lg':
      return 'text-base px-2.5 py-1.5 rounded-2xl'
  }
}

const toIconSizeClass = (input: ChipProps): string => {
  switch (input.size) {
    case 'sm':
      return 'size-4'
    case 'lg':
      return 'size-5'
  }
}
