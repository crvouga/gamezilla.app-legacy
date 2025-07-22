import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import { Typography } from './typography'

export const Slider = ({
  label,
  max,
  min,
  step,
  value,
  onInput,
}: {
  value: number
  label: TranslatedText
  min: number
  max: number
  step: number
  onInput?: (newValue: number) => void
}) => {
  return h(Box, {}, [
    h(Typography, { variant: 'label', text: label }),
    h('input', {
      type: 'range',
      min: min,
      max: max,
      value: value,
      step: step,
      onInput: (msgEvt: { target?: { value?: string } }) => {
        if (!msgEvt.target) {
          return
        }
        const val = 'value' in msgEvt.target ? msgEvt.target.value : ''
        const parsed = typeof val === 'string' ? Number.parseFloat(val) : Number.NaN
        if (Number.isNaN(parsed)) {
          return
        }
        onInput?.(parsed)
      },
      class: 'h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-500',
    }),
  ])
}
