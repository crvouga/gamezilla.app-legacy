import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { EmptyState } from '~/@/ui/empty-state'
import { IconExclamationCircle } from '~/@/ui/icon'
import { Puzzle } from './puzzle'

const schema = s.or(
  s.obj({
    t: s.l('got'),
    c: Puzzle,
  }),
  s.obj({
    t: s.l('not-found'),
  }),
)

export type PuzzleResult = s.Infer<typeof schema>

const ViewNotFound = (input: {
  ctx: { t: Translator }
  // onNextPuzzle: (() => void) | null
}) => {
  return (
    <EmptyState
      renderIcon={(props) => <IconExclamationCircle {...props} />}
      label={input.ctx.t('game.numberlink.puzzle-not-found')}
      // action={
      //   input.onNextPuzzle
      //     ? {
      //         label: input.ctx.t('app.next'),
      //         onClick: input.onNextPuzzle,
      //       }
      //     : null
      // }
    />
  )
}

export const PuzzleResult = {
  ...schema,
  ViewNotFound,
}
