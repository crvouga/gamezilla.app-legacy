import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'

export const ScreenNavBarTablet = (input: {
  title?: TranslatedText | null
  subtitle?: TranslatedText | null
  key?: string
  ctx: {
    t: Translator
  }
  back?: {
    onPress?: () => void
    renderSurface?: (input: { dropDown: DropDownConfig }) => VDom
  } | null
  renderEnd?: () => VDom
}) => {
  const renderSurface =
    input.back?.renderSurface ?? ((input: { dropDown: DropDownConfig }) => input.dropDown.reference?.render())
  return h(ScreenNavBarTabletRoot, {}, [
    input.back &&
      renderSurface({
        dropDown: {
          alignment: 'starting',
          position: 'bottom',
          reference: {
            render: () =>
              IconButton({
                onPress: input.back?.onPress,
                style: theme({ paddingX: 2 }),
                size: 'lg',
                label: input.ctx.t('app.exit'),
                renderIcon: (inputIcon) => IconArrowLeft(inputIcon),
                ariaLabel: input.ctx.t('app.back'),
              }),
          },
        },
      }),

    h(Box, { style: theme({ flexDirection: 'col', flex: 1, overflow: 'hidden' }) }, [
      input.title &&
        h(Typography, {
          role: 'heading',
          style: theme({ overflow: 'hidden', padding: 2, fontSize: '3xl', fontWeight: 'bold' }),
          variant: 'title',
          text: input.title,
        }),
      input.subtitle &&
        h(Typography, {
          style: theme({ overflow: 'hidden', padding: 2 }),
          color: 'text-secondary',
          role: 'heading',
          variant: 'subtitle',
          text: input.subtitle,
        }),
    ]),
    input.renderEnd?.(),
  ])
}

export const ScreenNavBarTabletRoot = (input: { children: VDom }) => {
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'row',
        height: 24,
        width: 'full',
        flexShrink: 0,
        alignItems: 'center',
        padding: 6,
      }),
    },
    [input.children],
  )
}
