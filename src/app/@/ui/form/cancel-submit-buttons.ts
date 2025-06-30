import { TranslatedText } from '~/@/l18n'
import { Button, ButtonInput } from '~/@/ui/button'
import { preventConsoleErrorWhenClosingDrawer } from '~/@/ui/surface-drawer/drawer-shared'
import { h } from '~/@/vdom/h'

export const CancelSubmitButtons = (input: {
  onCancel: () => void
  cancelText: TranslatedText
  cancelDisabled?: boolean
  submitText: TranslatedText
  submitLoading?: boolean
  submitDisabled?: boolean
  variant?: 'danger' | 'default'
  size?: ButtonInput['size']
}) => {
  return h(
    'div',
    {
      className: 'flex w-full items-center gap-4 px-6 pt-4 pb-6',
    },
    h(Button, {
      className: 'flex-1',
      size: input.size,
      onClick: (event) => {
        preventConsoleErrorWhenClosingDrawer(event)
        input.onCancel()
      },
      text: input.cancelText,
      disabled: input.cancelDisabled,
    }),
    h(Button, {
      className: 'flex-1',
      size: input.size,
      type: 'submit',
      color: input.variant === 'danger' ? 'danger' : 'primary',
      variant: 'contained',
      text: input.submitText,
      loading: input.submitLoading,
      disabled: input.submitDisabled,
    }),
  )
}
