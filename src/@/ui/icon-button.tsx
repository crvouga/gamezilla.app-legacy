import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'
import { ClickableTransparent } from './clickable'

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const IconButton = (input: {
  onClick?: (event: { currentTarget?: HTMLButtonElement | null }) => void
  label: TranslatedText
  renderIcon: (input: { className: string }) => VDom
  className?: string
  size?: IconButtonSize
  dataTestId?: string
}) => {
  return (
    <ClickableTransparent
      className={cn(
        'display flex items-center justify-center overflow-hidden rounded-full',
        toSizeClassName(input.size ?? 'md'),
        input.className,
      )}
      onClick={input.onClick}
      aria-label={input.label}
      title={input.label}
      dataTestId={input.dataTestId}
      type='button'
    >
      {input.renderIcon({
        className: 'w-full h-full cursor-pointer',
      })}
    </ClickableTransparent>
  )
}

export const IconButtonEmpty = (input: { size?: IconButtonSize }) => {
  return <div className={toSizeClassName(input.size ?? 'md')}></div>
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
