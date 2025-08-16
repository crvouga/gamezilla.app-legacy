import { Translator } from '~/@/l18n/generated'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import type { VDom } from '~/@/vdom/vdom'

export const LayoutGame = ({
  children,
  isSpectating,
  style,
  ctx,
  ...props
}: {
  ctx: {
    t: Translator
  }
  style?: Record<string, unknown>
  isSpectating?: boolean
  children?: VDom
}) => {
  return h(
    Box,
    {
      ...props,
      style: {
        ...sx({
          flexDirection: 'col',
          width: 'full',
          flex: 1,
        }),
        ...(isSpectating
          ? sx({
              borderWidth: 8,
              borderColor: 'blue-500',
            })
          : {}),
        ...style,
      },
    },
    [
      isSpectating &&
        h(
          Box,
          {
            style: sx({
              flexDirection: 'row',
              width: 'full',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'blue-500',
            }),
          },
          [
            h(Text, {
              text: ctx.t('game.you-are-spectating'),
              style: sx({ fontSize: 'sm', fontWeight: 'bold', textColor: 'white', padding: 1 }),
            }),
          ],
        ),
      children,
    ].filter(Boolean),
  )
}
