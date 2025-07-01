import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { EmptyState } from '~/@/ui/empty-state'
import { IconExclamationCircle } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
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
  return h(EmptyState, {
    renderIcon: (props) => h(IconExclamationCircle, props),
    label: input.ctx.t('game.numberlink.puzzle-not-found'),
  })
}

export const PuzzleResult = {
  ...schema,
  ViewNotFound,
}
