import { h } from '~/@/vdom/h'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'
import { theme } from '~/@/ui/theme/theme'

const Info = (input: { text: string }) => {
  return h(Typography, {
    text: TranslatedText.of(input.text),
    color: 'text-secondary',
    style: theme({
      flexDirection: 'row',
      width: 'full',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'xs',
    }),
  })
}

export const FeedItem = {
  Info,
}
