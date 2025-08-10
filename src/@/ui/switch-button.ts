import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { sx } from './theme/theme'

export const SwitchButton = ({
  onToggle,
  checked,
  label,
}: {
  label: string
  checked: boolean
  onToggle?: (e: Event | unknown) => void
}) => {
  return h(
    Pressable,
    {
      onPress: onToggle,
      'aria-checked': checked,
      'aria-label': label,
      style: {
        ...sx({
          position: 'relative',
          height: 6,
          width: 11,
          rounded: 'full',
          backgroundColor: checked ? 'blue-500' : 'neutral-700',
        }),
      },
    },
    [
      h(Box, {
        style: {
          ...sx({
            position: 'absolute',
            top: 0.5,
            size: 5,
            rounded: 'full',
            borderWidth: 1,
            backgroundColor: 'white',
            borderColor: checked ? 'white' : 'neutral-300',
          }),
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
        },
      }),
    ],
  )
}
