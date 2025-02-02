import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const IconButton = (input: {
  onClick?: (event: { currentTarget: HTMLButtonElement }) => void
  label: TranslatedText
  renderIcon: (input: { className: string }) => VDom
  className?: string
  size?: IconButtonSize
}) => {
  return (
    <button
      className={cn(
        'clickable display flex items-center justify-center overflow-hidden rounded-full',
        toSizeClassName(input.size ?? 'md'),
        input.className,
      )}
      type='button'
      onClick={input.onClick}
      aria-label={input.label}
      title={input.label}
    >
      {input.renderIcon({
        className: 'w-full h-full',
      })}
    </button>
  )
}

export const IconButtonEmpty = (input: { size?: IconButtonSize }) => {
  return <div className={toSizeClassName(input.size ?? 'md')}></div>
}

const toSizeClassName = (size: IconButtonSize): string => {
  return {
    xs: 'size-7 p-1',
    sm: 'size-8 p-1.5',
    md: 'size-10 p-2',
    lg: 'size-12 p-2.5',
  }[size]
}
