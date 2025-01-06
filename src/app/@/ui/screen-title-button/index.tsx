import { TranslatedText } from '~/@/l18n'
import { Typography } from '../typography'
import { Button } from '../button'

export const ScreenTitleButton = (input: {
  title: TranslatedText
  buttonText: TranslatedText
  onClick: () => void
}) => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4'>
      <Typography variant='title' text={input.title} />
      <Button onClick={input.onClick} size='lg' variant='contained' color='primary' text={input.buttonText} />
    </div>
  )
}
