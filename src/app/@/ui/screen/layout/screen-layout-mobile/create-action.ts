import { Button } from '~/@/ui/button'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScreenLayoutProps } from '../screen-layout-props'

export const CreateAction = (input: ScreenLayoutProps) => {
  if (!input.actionCreate) return null

  return h(
    Box,
    {
      class: 'absolute right-6 bottom-6 rounded-[30px]',
      style: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.7,
        shadowRadius: 16,
        elevation: 32,
      },
    },
    [
      h(Button, {
        color: 'primary',
        size: 'lg',
        variant: 'contained',
        fab: true,
        onPress: input.actionCreate.onSubmit,
        disabled: input.actionCreate.submitDisabled,
        loading: input.actionCreate.submitLoading,
        text: input.actionCreate.submitText,
        renderIconStart: input.actionCreate.submitIcon,
      }),
    ],
  )
}
