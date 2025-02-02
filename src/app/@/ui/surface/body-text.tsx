import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'

export const SurfaceBodyText = (input: { text: TranslatedText }) => {
  return <Typography className='px-6 py-3 text-left' variant='body' text={input.text} />
}
