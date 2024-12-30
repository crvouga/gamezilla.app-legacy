import { cn } from '~/app/@/ui'
import type { VDomChildren } from '~/@/vdom/vdom'
import { Translator } from '~/@/l18n/generated'

export const LayoutGame = ({
  children,
  isSpectating,
  className,
  ctx,
  ...props
}: {
  ctx: {
    t: Translator
  }
  className?: string
  isSpectating?: boolean
  children?: VDomChildren
}) => {
  return (
    <div
      className={cn(
        'flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll',
        isSpectating && 'border-8 border-t-0 border-blue-500',
        className
      )}
      {...props}
    >
      {isSpectating && (
        <div className='flex w-full items-center justify-center bg-blue-500 py-1 text-sm font-semibold text-white'>
          {ctx.t('game.you-are-spectating')}
        </div>
      )}
      {children}
    </div>
  )
}
