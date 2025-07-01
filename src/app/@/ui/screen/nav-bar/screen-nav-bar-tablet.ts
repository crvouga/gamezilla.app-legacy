import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import { VDom } from '~/@/vdom/vdom'

export const ScreenNavBarTablet = (input: {
  title?: TranslatedText | null
  subtitle?: TranslatedText | null
  key?: string
  ctx: {
    t: Translator
  }
  back?: {
    onClick?: () => void
    renderSurface?: (input: { dropDown: DropDownConfig }) => VDom
  } | null
  renderEnd?: () => VDom
}) => {
  const renderSurface = input.back?.renderSurface ?? ((input: { dropDown: DropDownConfig }) => input.dropDown.reference)
  return v(ScreenNavBarTabletRoot, {}, [
    input.back &&
      renderSurface({
        dropDown: {
          alignment: 'starting',
          position: 'bottom',
          reference: v(IconButton, {
            onClick: input.back.onClick,
            class: '-ml-2',
            size: 'lg',
            label: input.ctx.t('app.exit'),
            renderIcon: (inputIcon) => v(IconArrowLeft, inputIcon),
          }),
        },
      }),

    v('div', { class: 'flex flex-1 flex-col truncate' }, [
      input.title &&
        v(Typography, {
          role: 'heading',
          class: 'truncate px-2',
          sizeClassName: 'text-3xl font-bold',
          variant: 'title',
          text: input.title,
        }),
      input.subtitle &&
        v(Typography, {
          class: 'truncate px-2',
          color: 'text-secondary',
          sizeClassName: 'text-xl',
          role: 'heading',
          variant: 'subtitle',
          text: input.subtitle,
        }),
    ]),
    input.renderEnd?.(),
  ])
}

export const ScreenNavBarTabletRoot = (input: { children: VDom }) => {
  return v('div', { class: 'flex h-24 w-full shrink-0 items-center px-6' }, [input.children])
}
