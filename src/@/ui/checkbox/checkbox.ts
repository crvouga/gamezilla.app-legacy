import { h } from '~/@/vdom/h'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { Text } from '~/@/vdom/primitives/text'
import { theme } from '../theme/theme'

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

export const Checkbox = (input: { state: CheckboxState; onChange?: (checkedNew: boolean) => void }) => {
  const element = input.onChange ? 'button' : 'div'
  const isChecked = input.state === 'checked'
  return h(
    Pressable,
    {
      // class: cn(
      //   'flex flex-row size-6 items-center justify-center rounded border-2 border-neutral-500 text-xl font-black text-neutral-800',
      //   input.state !== 'unchecked' && 'border-neutral-100 bg-neutral-100',
      // ),
      style: theme({
        flex: 'row',
        items: 'center',
        justify: 'center',
        width: 6,
        height: 6,
        rounded: 'md',
        borderWidth: 2,
        borderColor: input.state !== 'unchecked' ? 'neutral-100' : 'neutral-500',
        backgroundColor: input.state !== 'unchecked' ? 'neutral-100' : undefined,
        textColor: 'neutral-800',
        textSize: 'xl',
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
    [h(Text, { text: toCheckboxText(input.state), style: theme({ textSize: 'lg', fontWeight: 'black' }) })],
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
