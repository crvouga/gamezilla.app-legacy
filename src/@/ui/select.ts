import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/text'
import { PAPER_STYLE } from './paper'
import { theme } from './theme/theme'

export const Select = <T>(props: {
  helperText?: string
  dataTestId?: string
  id: string
  label: TranslatedText
  options: T[]
  value?: T | null
  error?: boolean
  toKey: (option: T) => string
  toName: (option: T) => string
  startIcon?: VDom
  onChange: (value: T) => void
}) => {
  const labelId = `${props.id}-label`
  return h(
    Box,
    {
      style: theme({
        width: 'full',
        flexDirection: 'col',
        gap: 1,
      }),
      'data-testid': props.dataTestId,
    },
    [
      h(Text, {
        id: labelId,
        style: {
          ...theme({
            textSize: 16,
          }),
          color: props.error ? 'rgb(239 68 68)' : undefined,
        },
        text: props.label,
      }),
      h(
        // @ts-ignore
        'select',
        {
          id: props.id,
          style: {
            ...PAPER_STYLE,
            ...theme({
              flexDirection: 'row',
              alignItems: 'center',
              rounded: 'md',
              padding: 3,
              py: 4,
              textSize: 20,
            }),
            border: '1px solid',
            borderColor: props.error ? 'rgb(239 68 68)' : 'rgb(82 82 82)',
            color: props.error ? 'rgb(239 68 68)' : undefined,
            ':focus': {
              ringWidth: props.error ? undefined : '2px',
              ringColor: props.error ? undefined : 'rgb(59 130 246)',
            },
          },
          value: props.value ? props.toKey(props.value) : undefined,
          'default-value': props.value ? props.toKey(props.value) : undefined,
          'aria-labelledby': labelId,
          onChange: (e: { currentTarget: { value: string } }) => {
            for (const option of props.options) {
              if (props.toKey(option) === e.currentTarget.value) {
                props.onChange(option)
                return
              }
            }
          },
        },
        props.options.map((option) => {
          const isSelected = props.value && props.toKey(option) === props.toKey(props.value)
          return h(
            // @ts-ignore
            'option',
            {
              key: props.toKey(option),
              value: props.toKey(option),
              'data-selected': isSelected ? 'true' : 'false',
              selected: isSelected ? 'true' : undefined,
            },
            [props.toName(option)],
          )
        }),
      ),
      typeof props.helperText === 'string' &&
        h(
          Box,
          {
            style: {
              ...theme({
                textSize: 'sm',
              }),
              color: props.error ? 'rgb(239 68 68)' : undefined,
            },
          },
          [h(Text, { text: props.helperText })],
        ),
    ],
  )
}
