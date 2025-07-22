import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Touchable } from '~/@/vdom/primitives/touchable'

export const SwitchButton = ({
  onToggle,
  checked,
  label,
}: {
  label: string
  checked: boolean
  onToggle?: (e: Event | unknown) => void
}) => {
  return h(Box, { class: 'flex flex-row items-center space-x-2' }, [
    // h(Text, {}, label),
    h(
      Touchable,
      {
        onClick: onToggle,
        accessibilityRole: 'switch',
        accessibilityState: { checked },
        'aria-label': label,
        class: cn('relative h-6 w-11 rounded-full', checked ? 'bg-blue-500' : 'bg-neutral-200'),
      },
      [
        h(Box, {
          class: cn(
            'absolute top-0.5 h-5 w-5 rounded-full border bg-white transition-all',
            checked ? 'translate-x-[22px] border-white' : 'translate-x-[2px] border-neutral-300',
          ),
        }),
      ],
    ),
  ])
}
