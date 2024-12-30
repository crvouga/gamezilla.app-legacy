import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'

export const IconButton = (input: {
  onClick?: () => void
  label: string
  renderIcon: (input: { className: string }) => VDom
  className?: string
}) => {
  return (
    <button
      className={cn('display flex h-12 w-12 items-center justify-center overflow-hidden rounded-full', input.className)}
      onClick={input.onClick}
      aria-label={input.label}
    >
      {input.renderIcon({
        className: 'w-7 h-7'
      })}
    </button>
  )
}

export const IconButtonEmpty = () => {
  return <div className='h-12 w-12'></div>
}
