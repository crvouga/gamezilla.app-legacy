import { h } from '~/@/vdom/h'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'

const Info = (input: { text: string }) => {
  return h(Typography, {
    text: TranslatedText.of(input.text),
    color: 'text-secondary',
    class: 'flex flex-row w-full items-center justify-center text-xs',
  })
}

export const FeedItem = {
  Info,
}
