import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { IconXMark } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { preventConsoleErrorWhenClosingDrawer } from '~/@/ui/surface-drawer/drawer-shared'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { theme } from '../theme/theme'

export const SurfaceHeader = (input: {
  ctx: { t: Translator }
  title: TranslatedText | null
  onClose: () => void
  testId?: string
}) => {
  return h(
    Box,
    {
      'data-testid': input.testId,
      style: theme({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        justifyContent: 'center',
        paddingX: 6,
        paddingTop: 4,
        paddingBottom: 0,
      }),
    },
    [
      h(Box, { style: theme({ flex: 1 }) }, [
        input.title && h(Typography, { text: input.title, variant: 'title', style: theme({ fontSize: '2xl' }) }),
      ]),
      input.onClose &&
        h(IconButton, {
          label: input.ctx.t('app.close'),
          onPress: (event) => {
            preventConsoleErrorWhenClosingDrawer(event)
            input.onClose?.()
          },
          renderIcon: (inputIcon) => h(IconXMark, inputIcon),
        }),
    ],
  )
}
