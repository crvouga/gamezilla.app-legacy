import { IconLightbulb } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { AlgoIsSolved } from '../../solutions/algo-is-solved/algo-is-solved'
import { SolutionHash } from '../../solutions/solution-hash/solution-hash'
import { SolutionsDbQueryCache } from '../../solutions/solutions-db-query-cache'
import { ModePlayFrontendCtx } from '../frontend/ctx'
import { Model, Msg, toNumberlink } from './use-hint'

const TEST_ID_USE_HINT_ACTION = 'use-hint'

const viewAction = (input: {
  model: Model
  dispatch: (msg: Msg) => void
  ctx: ModePlayFrontendCtx
}): ScreenAction[] => {
  if (!input.ctx.numberlink) return []
  const numberlink = toNumberlink(input.model, input.ctx.numberlink)
  const hash = SolutionHash.init(numberlink)
  const solutions = SolutionsDbQueryCache.read(input.ctx, hash)
  const hasSolution = solutions.length > 0
  if (!hasSolution) return []
  const isSolved = AlgoIsSolved.isSolved(numberlink)

  return [
    {
      id: input.ctx.t('game.hint'),
      renderIcon: (input) => h(IconLightbulb, input),
      label: input.ctx.t('game.hint'),
      disabled: isSolved,
      onPress: () => {
        const numberlink = toNumberlink(input.model, input.ctx.numberlink)
        const hash = SolutionHash.init(numberlink)
        const solutions = SolutionsDbQueryCache.read(input.ctx, hash)
        input.dispatch({ t: 'user-clicked-use-hint', solutions })
      },
      testId: TEST_ID_USE_HINT_ACTION,
    },
  ]
}

const TestView = (input: { model: Model; dispatch: (msg: Msg) => void; ctx: ModePlayFrontendCtx }) => {
  return h(ScreenLayout, {
    ...input,
    parentScreen: null,
    id: 'use-hint',
    renderBody: () => null,
    actionBar: {
      variant: {
        t: 'uniform',
        actions: viewAction(input),
      },
    },
  })
}

export const UseHintFrontend = {
  TEST_ID_USE_HINT_ACTION,
  viewAction,
  TestView,
}
