import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/box'
import { Translator } from '~/@/l18n/generated'
import { IconXMark } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { preventConsoleErrorWhenClosingDrawer } from '~/@/ui/surface-drawer/drawer-shared'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export const SurfaceHeader = (input: {
  ctx: { t: Translator }
  title: TranslatedText | null
  onClose: () => void
  testId?: string
}) => {
  return h(Box, { class: 'flex w-full items-center justify-center px-6 pt-4 pb-0', 'data-testid': input.testId }, [
    h(Box, { class: 'flex-1' }, [
      input.title && h(Typography, { text: input.title, variant: 'title', sizeClassName: 'text-2xl' }),
    ]),
    input.onClose &&
      h(IconButton, {
        label: input.ctx.t('app.close'),
        onClick: (event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onClose?.()
        },
        class: '-mr-1',
        renderIcon: (inputIcon) => h(IconXMark, inputIcon),
      }),
  ])
}
