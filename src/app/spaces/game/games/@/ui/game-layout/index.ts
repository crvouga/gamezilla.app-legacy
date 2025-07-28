import { Translator } from '~/@/l18n/generated'
import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
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
    Box,
    {
      class: cn('flex w-full flex-1 flex-col', isSpectating && 'border-8 border-t-0 border-blue-500', class_),
      ...props,
    },
    [
      isSpectating &&
        h(
          Box,
          {
            class: 'flex flex-row w-full items-center justify-center bg-blue-500 py-1 text-sm font-semibold text-white',
          },
          [Text({ text: ctx.t('game.you-are-spectating') })],
        ),
      children,
    ].filter(Boolean),
  )
}
