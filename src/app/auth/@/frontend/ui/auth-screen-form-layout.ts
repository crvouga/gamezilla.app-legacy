import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Button } from '~/@/ui/button'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { AuthScreenHeader } from './auth-screen-header'
import { AuthScreenLayout } from './auth-screen-layout'
import { sx } from '~/@/ui/theme/theme'

export const AuthScreenFormLayout = (input: {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  title: TranslatedText
  onBack: () => void
  renderInputs: () => VDom
  submitText: TranslatedText
  submitLoading: boolean
  submitDisabled: boolean
  onSubmit: () => void
  testId: string
}) => {
  return h(
    AuthScreenLayout,
    {
      testId: input.testId,
      ctx: input.ctx,
      center: false,
    },
    [
      h(AuthScreenHeader, {
        ctx: input.ctx,
        title: input.title,
        onBack: input.onBack,
      }),
      h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 16, paddingTop: 4 }) }, [
        h(
          Box,
          {
            style: sx({ flexDirection: 'col', width: 'full', gap: 6 }),
          },
          [input.renderInputs()],
        ),
        h(Button, {
          color: 'primary',
          size: 'lg',
          style: sx({ width: 'full' }),
          variant: 'contained',
          onPress: input.onSubmit,
          text: input.submitText,
          loading: input.submitLoading,
          disabled: input.submitDisabled,
          width: 'full',
        }),
      ]),
    ],
  )
}
