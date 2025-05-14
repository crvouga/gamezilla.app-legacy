import { Translator } from '~/@/l18n/generated'
import { p } from '~/@/parser'
import { EmptyState } from '~/@/ui/empty-state'
import { IconExclamationCircle } from '~/@/ui/icon/icon-exclamation-circle'
import { Puzzle } from './puzzle'

const parser = p.or(
  p.obj({
    t: p.l('got'),
    c: Puzzle,
  }),
  p.obj({
    t: p.l('not-found'),
  }),
)

export type PuzzleResult = p.Infer<typeof parser>

const ViewNotFound = (input: {
  ctx: { t: Translator }
  // onNextPuzzle: (() => void) | null
}) => {
  return (
    <EmptyState
      renderIcon={(props) => <IconExclamationCircle {...props} />}
      label={input.ctx.t('flow.puzzle-not-found')}
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
  ...parser,
  ViewNotFound,
}
