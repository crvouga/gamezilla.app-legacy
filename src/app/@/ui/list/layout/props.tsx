import { TranslatedText } from '~/@/l18n'

export type Chip = {
  label: TranslatedText
  onClick: () => void
}

export type ListLayoutProps = {
  filterChips: Chip[]
  sortChips: Chip[]
}
