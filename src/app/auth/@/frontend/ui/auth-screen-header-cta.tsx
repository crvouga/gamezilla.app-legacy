import { Translator } from '~/@/l18n/generated'
import { Typography } from '~/@/ui'

export const AuthScreenHeaderCta = (input: {
  ctx: {
    t: Translator
  }
}) => {
  return (
    <div className='flex w-full flex-col items-start justify-center'>
      <Typography text={input.ctx.t('auth.sign-in-to')} variant='title' />
      <span className='bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent'>
        {input.ctx.t('app.gamezilla-app')}
      </span>
    </div>
  )
}
