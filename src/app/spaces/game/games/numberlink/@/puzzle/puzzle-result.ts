import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { EmptyState } from '~/@/ui/empty-state'
import { IconExclamationCircle } from '~/@/ui/icon'
import { v } from '~/@/vdom/v'
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

const ViewNotFound = (input: { ctx: { t: Translator } }) => {
  return v(EmptyState, {
    renderIcon: (props) => v(IconExclamationCircle, props),
    label: input.ctx.t('game.numberlink.puzzle-not-found'),
  })
}

export const PuzzleResult = {
  ...schema,
  ViewNotFound,
}
