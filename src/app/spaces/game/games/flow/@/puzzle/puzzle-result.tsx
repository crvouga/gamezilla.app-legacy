import { Translator } from '~/@/l18n/generated'
import { p } from '~/@/parser'
import { IconExclamationCircle, Typography } from '~/app/@/ui'
import { Puzzle } from './puzzle'

const parser = p.or(
  p.obj({
    t: p.l('got'),
    c: Puzzle
  }),
  p.obj({
    t: p.l('not-found')
  })
)

export type PuzzleResult = p.Infer<typeof parser>

const ViewNotFound = (input: { ctx: { t: Translator } }) => {
  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center gap-10'>
      <div className='flex w-full flex-col items-center justify-center gap-4 opacity-80'>
        <IconExclamationCircle className='h-12 w-12' />
        <Typography variant='title' className='text-2xl font-bold' text={input.ctx.t('flow.puzzle-not-found')} />
      </div>
    </div>
  )
}

export const PuzzleResult = {
  ...parser,
  ViewNotFound
}
