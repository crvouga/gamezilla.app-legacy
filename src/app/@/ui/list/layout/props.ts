import { TranslatedText } from '~/@/l18n'
import { VDom } from '~/@/vdom/vdom'

export type Chip = {
  label: TranslatedText
  onClick: () => void
}

export type ListLayoutProps<T> = {
  filterChips: Chip[]
  sortChips: Chip[]
  renderItem: (input: { item: T }) => VDom
}
