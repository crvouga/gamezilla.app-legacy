import { h } from '~/@/vdom/h'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { Text } from '~/@/vdom/primitives/text'
import { sx } from '../theme/theme'

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

export const Checkbox = (input: { state: CheckboxState; onChange?: (checkedNew: boolean) => void }) => {
  const element = input.onChange ? 'button' : 'div'
  const isChecked = input.state === 'checked'
  return h(
    Pressable,
    {
      style: sx({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 6,
        height: 6,
        rounded: 'md',
        borderWidth: 2,
        borderColor: input.state !== 'unchecked' ? 'neutral-100' : 'neutral-500',
        backgroundColor: input.state !== 'unchecked' ? 'neutral-100' : undefined,
        textColor: 'neutral-800',
        fontSize: 'xl',
        fontWeight: 'black',
      }),
      role: 'checkbox',
      'aria-checked': input.state === 'checked',
      tabIndex: element === 'button' ? 0 : null,
      onPress: () => {
        input.onChange?.(!isChecked)
      },
      onKeyDown: (e: unknown) => {
        if (element === 'button' && typeof e === 'object' && e !== null && 'key' in e && e.key === 'Enter') {
          input.onChange?.(!isChecked)
        }
      },
    },
    [h(Text, { text: toCheckboxText(input.state), style: sx({ fontSize: 'lg', fontWeight: 'black' }) })],
  )
}

const toCheckboxText = (state: CheckboxState): string => {
  switch (state) {
    case 'checked':
      return '✓'
    case 'unchecked':
      return ''
    case 'indeterminate':
      return '—'
  }
}
