import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { IconXMark } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { preventConsoleErrorWhenClosingDrawer } from '~/@/ui/surface-drawer/drawer-shared'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'

export const SurfaceHeader = (input: { ctx: { t: Translator }; title: TranslatedText | null; onClose: () => void }) => {
  return v('div', { class: 'flex w-full items-center justify-center px-6 pt-4 pb-0' }, [
    v('div', { class: 'flex-1' }, [
      input.title && v(Typography, { text: input.title, variant: 'title', sizeClassName: 'text-2xl' }),
    ]),
    input.onClose &&
      v(IconButton, {
        label: input.ctx.t('app.close'),
        onClick: (event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onClose?.()
        },
        class: '-mr-1',
        renderIcon: (inputIcon) => v(IconXMark, inputIcon),
      }),
  ])
}
