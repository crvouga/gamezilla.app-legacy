import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton, IconButtonEmpty } from '~/@/ui/icon-button'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'

export const ScreenNavBarMobile = (input: {
  title?: TranslatedText | null
  key?: string
  subtitle?: TranslatedText | null
  ctx: {
    t: Translator
  }
  back?: {
    onPress?: () => void
    renderSurface?: (input: { dropDown: DropDownConfig }) => VDom
  } | null
}) => {
  if (!input.title && !input.subtitle && !input.back) return null

  const renderSurface =
    input.back?.renderSurface ?? ((input: { dropDown: DropDownConfig }) => input.dropDown.reference?.render())

  const shouldRenderBack = input.back && typeof input.back.onPress === 'function'

  return h(
    Box,
    {
      style: theme({
        height: 16,
        width: 'full',
        items: 'center',
        justify: 'center',
        overflow: 'hidden',
        flexDirection: 'row',
        px: 3,
      }),
    },
    [
      shouldRenderBack &&
        renderSurface({
          dropDown: {
            alignment: 'starting',
            position: 'bottom',
            reference: {
              render: () =>
                h(IconButton, {
                  onPress: input.back?.onPress,
                  label: input.ctx.t('app.exit'),
                  ariaLabel: input.ctx.t('app.back'),
                  renderIcon: (inputIcon) => h(IconArrowLeft, inputIcon),
                  size: 'lg',
                }),
            },
          },
        }),

      h(
        Box,
        {
          style: theme({
            flex: 1,
            flexDirection: 'col',
            overflow: 'hidden',
            items: 'center',
            justify: 'center',
          }),
        },
        [
          typeof input.title === 'string' &&
            h(Typography, {
              role: 'heading',
              variant: 'title',
              text: input.title,
              align: 'center',
              style: theme({
                textSize: 'xl',
                fontWeight: 'bold',
                textAlign: 'center',
                flexDirection: 'col',
                items: 'center',
                justify: 'center',
              }),
            }),

          typeof input.subtitle === 'string' &&
            input.subtitle.length > 0 &&
            h(Typography, {
              role: 'heading',
              variant: 'subtitle',
              text: input.subtitle,
              align: 'center',
              style: theme({
                textSize: 'xs',
                textAlign: 'center',
                px: 2,
                textColor: 'neutral-300',
              }),
            }),
        ],
      ),

      shouldRenderBack && h(IconButtonEmpty, {}),
    ],
  )
}
