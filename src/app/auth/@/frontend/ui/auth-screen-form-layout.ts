import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Button } from '~/@/ui/button'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { AuthScreenHeader } from './auth-screen-header'
import { AuthScreenLayout } from './auth-screen-layout'
import { Frag } from '~/@/ui/frag'

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
  dataTestId: string
}) => {
  return h(AuthScreenLayout, {
    dataTestId: input.dataTestId,
    ctx: input.ctx,
    center: false,
    children: h(Frag, null, [
      h(AuthScreenHeader, {
        ctx: input.ctx,
        title: input.title,
        onBack: input.onBack,
      }),
      h('form', {
        className: 'flex w-full flex-col gap-16 pt-4',
        onSubmit: (e: Event) => {
          e.preventDefault()
          input.onSubmit()
        },
        children: h(Frag, null, [
          h('div', {
            className: 'flex w-full flex-col gap-6',
            children: input.renderInputs(),
          }),
          h(Button, {
            color: 'primary',
            size: 'lg',
            className: 'w-full',
            variant: 'contained',
            type: 'submit',
            text: input.submitText,
            loading: input.submitLoading,
            disabled: input.submitDisabled,
          }),
        ]),
      }),
    ]),
  })
}
