import { TranslatedText } from '~/@/l18n'
import { v } from '~/@/vdom/v'
import { VDom } from '~/@/vdom/vdom'
import { Clickable } from '../clickable'
import { cn } from '../cn'
import { Frag } from '../frag'

export type ChipSize = 'sm' | 'lg'

export type ChipProps = {
  renderStartIcon?: (input: { className: string }) => VDom
  label: TranslatedText
  size: ChipSize
  onClick?: () => void
}

export const Chip = (input: ChipProps) => {
  return v(Tag, {
    tagName: typeof input.onClick === 'function' ? 'button' : 'div',
    className: cn('flex items-center gap-1 truncate border border-white/30 font-semibold', toSizeClass(input)),
    onClick: input.onClick,
    children: v(Frag, null, [
      input.renderStartIcon?.({
        className: cn(toIconSizeClass(input), 'shrink-0'),
      }),
      v('span', { className: 'truncate' }, [input.label]),
    ]),
  })
}

const Tag = ({
  children,
  tagName,
  ...input
}: {
  children: VDom
  tagName: 'div' | 'button'
  onClick?: () => void
  className?: string
}) => {
  switch (tagName) {
    case 'button':
      return v(Clickable, input, [children])
    default:
      return v('div', input, [children])
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
