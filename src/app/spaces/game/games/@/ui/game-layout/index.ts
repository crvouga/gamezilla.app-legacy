import { Translator } from '~/@/l18n/generated'
import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const LayoutGame = ({
  children,
  isSpectating,
  class: class_,
  ctx,
  ...props
}: {
  ctx: {
    t: Translator
  }
  class?: string
  isSpectating?: boolean
  children?: VDom
}) => {
  return h(
    'div',
    {
      class: cn(
        'flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll',
        isSpectating && 'border-8 border-t-0 border-blue-500',
        class_,
      ),
      ...props,
    },
    [
      isSpectating &&
        h(
          'div',
          {
            class: 'flex w-full items-center justify-center bg-blue-500 py-1 text-sm font-semibold text-white',
          },
          [ctx.t('game.you-are-spectating')],
        ),
      children,
    ].filter(Boolean),
  )
}
