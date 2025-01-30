import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { IconArrowLeft, IconButton, Typography } from '~/@/ui'

export const AuthScreenHeader = (input: {
  ctx: {
    t: Translator
  }
  title: TranslatedText
  onBack: () => void
}) => {
  return (
    <div className='flex w-full flex-row items-center justify-start gap-2'>
      <IconButton
        className='-ml-2'
        label={input.ctx.t('app.back')}
        renderIcon={(iconInput) => <IconArrowLeft {...iconInput} />}
        onClick={input.onBack}
      />
      <Typography text={input.title} variant='title' className='font-bold' />
    </div>
  )
}
