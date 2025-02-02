import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui'

export const SectionTitle = (input: { text: TranslatedText }) => {
  return <Typography className='px-6' sizeClassName='text-2xl font-bold' variant='title' text={input.text} />
}
