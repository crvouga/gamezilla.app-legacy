import { h } from '~/@/vdom/h'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'

export const SectionTitle = (input: { text: TranslatedText }) => {
  return h(Typography, { class: 'px-6', sizeClassName: 'text-2xl', variant: 'title', text: input.text })
}
