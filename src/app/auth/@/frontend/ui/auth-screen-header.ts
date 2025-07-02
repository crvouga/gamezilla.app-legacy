import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { ScreenTestIds } from '~/app/@/ui/screen/screen-test-ids'

export const AuthScreenHeader = (input: {
  ctx: {
    t: Translator
  }
  title: TranslatedText
  onBack: () => void
}) => {
  return h(
    'div',
    {
      class: 'flex w-full flex-row items-center justify-start gap-2',
    },
    [
      h(IconButton, {
        class: '-ml-2',
        label: input.ctx.t('app.back'),
        renderIcon: (iconInput) => h(IconArrowLeft, iconInput),
        onClick: input.onBack,
        dataTestId: ScreenTestIds.backButton,
      }),
      h(Typography, {
        text: input.title,
        variant: 'title',
        class: 'font-bold',
      }),
    ],
  )
}
