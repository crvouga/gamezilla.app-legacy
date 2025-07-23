import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
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
  onSubmit: () => void
  variant?: 'danger' | 'default'
  size?: ButtonInput['size']
}) => {
  return h(
    Box,
    {
      class: 'flex flex-row w-full items-center gap-4 px-6 pt-4 pb-6',
    },
    [
      h(Button, {
        class: 'flex-1',
        size: input.size,
        onClick: (event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onCancel()
        },
        text: input.cancelText,
        disabled: input.cancelDisabled,
      }),
      h(Button, {
        class: 'flex-1',
        size: input.size,
        onClick: input.onSubmit,
        color: input.variant === 'danger' ? 'danger' : 'primary',
        variant: 'contained',
        text: input.submitText,
        loading: input.submitLoading,
        disabled: input.submitDisabled,
      }),
    ],
  )
}
