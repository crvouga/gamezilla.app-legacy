import { v } from '~/@/vdom/v'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'

const Info = (input: { text: string }) => {
  return v(Typography, {
    text: TranslatedText.of(input.text),
    color: 'text-secondary',
    class: 'flex w-full items-center justify-center text-xs',
  })
}

export const FeedItem = {
  Info,
}
