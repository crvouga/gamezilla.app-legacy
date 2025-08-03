import { TranslatedText } from '~/@/l18n'
import { Button, ButtonInput } from '~/@/ui/button'
import { preventConsoleErrorWhenClosingDrawer } from '~/@/ui/surface-drawer/drawer-shared'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

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
      style: theme({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'full',
        gap: 4,
        paddingTop: 4,
        paddingBottom: 6,
        paddingX: 6,
      }),
    },
    [
      h(Button, {
        style: theme({
          flex: 1,
        }),
        size: input.size,
        onPress: (event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onCancel()
        },
        text: input.cancelText,
        disabled: input.cancelDisabled,
      }),
      h(Button, {
        style: theme({
          flex: 1,
        }),
        size: input.size,
        onPress: input.onSubmit,
        color: input.variant === 'danger' ? 'danger' : 'primary',
        variant: 'contained',
        text: input.submitText,
        loading: input.submitLoading,
        disabled: input.submitDisabled,
      }),
    ],
  )
}
