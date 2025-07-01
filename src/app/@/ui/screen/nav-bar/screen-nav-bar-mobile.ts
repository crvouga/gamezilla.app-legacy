import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton, IconButtonEmpty } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'

export const ScreenNavBarMobile = (input: {
  title?: TranslatedText | null
  subtitle?: TranslatedText | null
  ctx: {
    t: Translator
  }
  back?: {
    onClick?: () => void
    renderSurface?: (input: { dropDown: DropDownConfig }) => VDom
  } | null
}) => {
  if (!input.title && !input.subtitle && !input.back) return null

  const renderSurface = input.back?.renderSurface ?? ((input: { dropDown: DropDownConfig }) => input.dropDown.reference)
  const shouldRenderBack = input.back && typeof input.back.onClick === 'function'
  return h(
    'div',
    {
      className: 'flex h-16 w-full shrink-0 items-center truncate px-6 text-center',
    },
    [
      shouldRenderBack &&
        renderSurface({
          dropDown: {
            alignment: 'starting',
            position: 'bottom',
            reference: h(IconButton, {
              onClick: input.back?.onClick,
              className: '-ml-2',
              label: input.ctx.t('app.exit'),
              renderIcon: (inputIcon) => h(IconArrowLeft, inputIcon),
            }),
          },
        }),

      h(
        'div',
        {
          className: 'flex flex-1 flex-col truncate',
        },
        [
          typeof input.title === 'string' &&
            h(Typography, {
              role: 'heading',
              sizeClassName: 'text-lg font-bold',
              className: 'truncate px-2',
              variant: 'title',
              text: input.title,
            }),

          typeof input.subtitle === 'string' &&
            h(Typography, {
              className: 'truncate px-2 text-xs',
              color: 'text-secondary',
              role: 'heading',
              variant: 'subtitle',
              text: input.subtitle,
            }),
        ],
      ),

      shouldRenderBack && h(IconButtonEmpty),
    ],
  )
}
