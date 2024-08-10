import { Translator } from 'gamezilla-app/@/l18n/generated'
import { IconExclamationCircle, Typography } from 'gamezilla-app/app/@/ui'

export const ViewPuzzleNotFound = (input: { ctx: { t: Translator } }) => {
  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center gap-10'>
      <div className='flex w-full flex-col items-center justify-center gap-4 opacity-80'>
        <IconExclamationCircle className='h-12 w-12' />
        <Typography variant='title' className='text-2xl font-bold' text={input.ctx.t('flow.puzzle-not-found')} />
      </div>
    </div>
  )
}
