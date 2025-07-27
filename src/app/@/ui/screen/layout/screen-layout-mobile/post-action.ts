import { Button } from '~/@/ui/button'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScreenLayoutProps } from '../screen-layout-props'

export const PostAction = (input: ScreenLayoutProps) => {
  if (!input.postAction) return null

  return h(Box, { class: 'absolute right-4 bottom-6 flex flex-row' }, [
    h(Button, {
      color: 'primary',
      class: 'self-start px-4',
      width: 'fit',
      size: 'lg',
      variant: 'contained',
      fab: true,
      onPress: input.postAction.onSubmit,
      disabled: input.postAction.submitDisabled,
      loading: input.postAction.submitLoading,
      text: input.postAction.submitText,
      renderIconStart: input.postAction.submitIcon,
    }),
  ])
}
