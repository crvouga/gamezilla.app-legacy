import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'
import { TranslatedText } from '~/@/l18n'

export const IconButton = (input: {
  onClick?: (event: { currentTarget: HTMLButtonElement }) => void
  label: TranslatedText
  renderIcon: (input: { className: string }) => VDom
  className?: string
}) => {
  return (
    <button
      className={cn(
        'clickable display flex size-12 items-center justify-center overflow-hidden rounded-full',
        input.className,
      )}
      type='button'
      onClick={input.onClick}
      aria-label={input.label}
      title={input.label}
    >
      {input.renderIcon({
        className: 'size-8',
      })}
    </button>
  )
}

export const IconButtonEmpty = () => {
  return <div className='size-12'></div>
}
