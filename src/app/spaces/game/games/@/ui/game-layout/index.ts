import { Translator } from '~/@/l18n/generated'
import { theme } from '~/@/ui/theme/theme'
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
        ...theme({
          flexDirection: 'col',
          width: 'full',
          flex: 1,
        }),
        ...(isSpectating
          ? theme({
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
            style: theme({
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
              style: theme({ textSize: 'sm', fontWeight: 'bold', textColor: 'white', padding: 1 }),
            }),
          ],
        ),
      children,
    ].filter(Boolean),
  )
}
