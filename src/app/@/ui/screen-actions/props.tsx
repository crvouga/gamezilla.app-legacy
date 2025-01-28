import { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'

export type ScreenAction = {
  label: TranslatedText
  disabled?: boolean
  icon: (input: { className: string }) => VDom
  classNames?: {
    button?: string
    label?: string
  }
  onClick: () => void
  loading?: boolean
  color?: 'danger' | 'success' | 'inherit' | 'selected'
  hidden?: boolean
  badge?: number
  size?: 'sm' | 'md'
}

export type ScreenActionCtx = {
  t: Translator
}

export type ScreenActionProps = {
  id: string
  ctx: ScreenActionCtx
  buttons: (ScreenAction | null)[]
  open: boolean
  onToggle: () => void
  limit?: number
  size?: 'sm' | 'md'
  renderNavBar?: () => VDom
}
