import { TranslatedText } from '~/@/l18n'
import { VDom, VDomChildren } from '~/@/vdom/vdom'
import { cn } from '../cn'

export type ChipSize = 'sm' | 'lg'

export type ChipProps = {
  renderStartIcon?: (input: { className: string }) => VDom
  label: TranslatedText
  size: ChipSize
  onClick?: () => void
}

export const Chip = (input: ChipProps) => {
  return (
    <Tag
      tagName={typeof input.onClick === 'function' ? 'button' : 'div'}
      className={cn(
        'flex items-center gap-1 border border-white/30 font-semibold',
        toSizeClass(input),
        toButtonClass(input),
      )}
      onClick={input.onClick}
    >
      {input.renderStartIcon?.({ className: toIconSizeClass(input) })}
      {input.label}
    </Tag>
  )
}

const Tag = ({
  children,
  tagName,
  ...input
}: {
  children: VDomChildren
  tagName: string
  onClick?: () => void
  className?: string
}) => {
  switch (tagName) {
    case 'button':
      return <button {...input}>{children}</button>
    default:
      return <div {...input}>{children}</div>
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

const toButtonClass = (input: ChipProps): string | null => {
  if (typeof input.onClick === 'function') {
    return 'clickable'
  }
  return null
}
