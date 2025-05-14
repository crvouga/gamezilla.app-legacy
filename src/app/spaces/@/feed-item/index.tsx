import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui'

const Info = (input: { text: string }) => {
  return (
    <Typography
      text={TranslatedText.of(input.text)}
      color='text-secondary'
      className='flex w-full items-center justify-center text-xs'
    />
  )
}

export const FeedItem = {
  Info,
}
