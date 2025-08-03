import { TranslatedText } from '~/@/l18n'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export const SectionTitle = (input: { text: TranslatedText }) => {
  return h(Typography, {
    style: theme({ padding: 6, fontSize: '2xl' }),
    variant: 'title',
    text: input.text,
  })
}
