import { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '../screen-size'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'

export type ScreenActionLocation = 'bar' | 'more-drawer'

export type ScreenAction = {
  id: string
  label: TranslatedText
  disabled?: boolean
  icon: (input: { class: string }) => VDom
  classNames?: {
    button?: string
    label?: string
  }
  testId?: string
  onPress: () => void
  loading?: boolean
  color?: 'danger' | 'success' | 'inherit' | 'selected'
  hidden?: boolean
  badge?: number
  size?: 'sm' | 'md'
  renderSurface?: (props: { dropDown: DropDownConfig; screenActionLocation: ScreenActionLocation }) => VDom
}

export type ScreenActionsUniform = {
  t: 'uniform'
  actions: (ScreenAction | null)[]
  limit?: {
    max: number
    open: boolean
    onToggle: () => void
  }
}

export type ScreenActionsSpaceBetween = {
  t: 'space-between'
  start: (ScreenAction | null)[]
  end: (ScreenAction | null)[]
}

export type ScreenActions = ScreenActionsUniform | ScreenActionsSpaceBetween

export type ScreenActionBarProps = {
  key?: string
  id: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  variant: ScreenActions
  size?: 'sm' | 'md'
  renderNavBar?: () => VDom
}
