import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { theme } from './theme/theme'

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
        ...theme({
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
          ...theme({
            position: 'absolute',
            top: 0.5,
            height: 5,
            width: 5,
            rounded: 'full',
            borderWidth: 1,
            backgroundColor: 'white',
            borderColor: checked ? 'white' : 'neutral-300',
          }),
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
          transition: 'all',
        },
      }),
    ],
  )
}
