import { h } from '../h'

export const TextInput = (props: {
  value?: string | number
  onInput?: (e: unknown) => void
  placeholder?: string
  class?: string
  id?: string
  type?: string
  autoFocus?: boolean
  role?: string
  disabled?: boolean
  readOnly?: boolean
  'data-testid'?: string
  maxLength?: number
  minLength?: number
  min?: number
  max?: number
  name?: string
  autoComplete?: string
  autoCapitalize?: string
  autoCorrect?: string
  spellCheck?: boolean
  inputMode?: string
  pattern?: string
  required?: boolean
  'auto-complete'?: string
  'auto-capitalize'?: string
  'auto-correct'?: string
  'auto-save'?: string
  step?: number
  'aria-label'?: string
  'aria-required'?: 'true' | 'false'
  tabIndex?: number
  onFocus?: (e: unknown) => void
  onBlur?: (e: unknown) => void
  onChange?: (e: { target: { value: string } }) => void
  onKeyDown?: (e: unknown) => void
  onKeyUp?: (e: unknown) => void
  onKeyPress?: (e: unknown) => void
  onClick?: (e: unknown) => void
  onPaste?: (e: unknown) => void
  onCopy?: (e: unknown) => void
  onCut?: (e: unknown) => void
  style?: Record<string, string>
  testId?: string
}) => {
  // @ts-ignore
  return h('input', props, [])
}
