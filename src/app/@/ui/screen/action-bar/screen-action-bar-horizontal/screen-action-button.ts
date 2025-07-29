import { ClickableTransparent } from '~/@/ui/clickable'
import { cn } from '~/@/ui/cn'
import { Spinner } from '~/@/ui/spinner'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScreenAction } from '../screen-action-bar-props'

export const ScreenActionButton = (input: ScreenAction & { class?: string }) => {
  const isDisabled = input.disabled || input.loading
  const size = input.size ?? 'md'
  if (input.hidden) return null
  const colorClasses = toColorClasses(input)
  return h(
    ClickableTransparent,
    {
      role: 'button',
      disabled: isDisabled,
      'aria-disabled': isDisabled,
      'aria-label': input.label,
      'aria-hidden': input.hidden,
      onPress: input.onPress,
      class: cn(
        'relative flex flex-col items-center gap-0.5 font-normal h-16',
        'disabled:cursor-not-allowed disabled:opacity-50',
        colorClasses,
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
        input.class,
      ),
    },
    [
      h(
        Box,
        {
          class: cn(
            'flex h-full w-full flex-col items-center justify-center gap-0.5 truncate',
            input.loading ? 'opacity-0' : 'opacity-100',
          ),
        },
        [
          input.icon({
            class: cn(toIconSizeClasses(size), colorClasses),
            fill: 'currentColor',
            stroke: 'currentColor',
          }),
          h(Typography, {
            variant: 'label',
            text: input.label,
            class: cn(input.classNames?.label, colorClasses),
            colorClassName: colorClasses,
          }),
        ],
      ),

      input.loading &&
        h(
          Box,
          {
            class: 'absolute inset-0 flex flex-row h-full w-full items-center justify-center',
          },
          [
            h(Spinner, {
              class: toIconSizeClasses(size),
              iconClass: toIconSizeClasses(size),
            }),
          ],
        ),
    ],
  )
}

const toColorClasses = (input: ScreenAction): string => {
  switch (input.color) {
    case 'danger':
      return 'text-red-500 fill-red-500 stroke-red-500'
    case 'success':
      return 'text-green-500 fill-green-500 stroke-green-500'
    case 'selected':
      return 'text-blue-500 fill-blue-500 stroke-blue-500'
    default:
      return 'text-white fill-white stroke-white'
  }
}

const toSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'text-xs h-10'
    case 'md':
    default:
      return 'text-sm h-12'
  }
}

const toIconSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'w-5 h-5'
    case 'md':
    default:
      return 'w-8 h-8'
  }
}
