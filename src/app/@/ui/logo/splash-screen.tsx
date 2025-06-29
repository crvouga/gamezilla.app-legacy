import { Typography } from '~/@/ui/typography'
import { LOGO_TEXT } from './logo-text'
import { TranslatedText } from '~/@/l18n'

export const SplashScreen = (input: { reason: TranslatedText }) => {
  return (
    <div className='fixed inset-0 grid place-items-center gap-4 text-7xl'>
      {LOGO_TEXT}
      <Typography
        text={input.reason}
        variant='caption'
        color='text-secondary'
        className='fixed bottom-10 left-1/2 -translate-x-1/2'
      />
    </div>
  )
}
