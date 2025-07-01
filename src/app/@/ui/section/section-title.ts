import { v } from '~/@/vdom/v'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'

export const SectionTitle = (input: { text: TranslatedText }) => {
  return v(Typography, { className: 'px-6', sizeClassName: 'text-2xl', variant: 'title', text: input.text })
}
