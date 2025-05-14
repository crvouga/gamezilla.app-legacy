import { IconLightbulb } from '~/@/ui/icon/icon-lightbulb'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { AlgoIsSolved } from '../../solutions/algo-is-solved/algo-is-solved'
import { SolutionHash } from '../../solutions/solution-hash/solution-hash'
import { Solutions } from '../../solutions/solutions'
import { ModePlayFrontendCtx } from '../frontend/ctx'
import { Model, Msg, toFlow } from './use-hint'

const TEST_ID_USE_HINT_ACTION = 'use-hint'

const viewAction = (input: {
  model: Model
  dispatch: (msg: Msg) => void
  ctx: ModePlayFrontendCtx
}): ScreenAction[] => {
  if (!input.ctx.flow) return []
  const flow = toFlow(input.model, input.ctx.flow)
  const hash = SolutionHash.init(flow)
  const hasSolution = Solutions.selectOne(input.ctx.solutions, hash) !== null
  if (!hasSolution) return []
  const isSolved = AlgoIsSolved.isSolved(flow)
  if (isSolved) return []

  return [
    {
      id: input.ctx.t('game.hint'),
      icon: (input) => <IconLightbulb {...input} />,
      label: input.ctx.t('game.hint'),
      onClick: () => {
        const flow = toFlow(input.model, input.ctx.flow)
        const hash = SolutionHash.init(flow)
        const solutions = Solutions.limit(input.ctx.solutions, hash)
        input.dispatch({ t: 'user-clicked-use-hint', solutions })
      },
      testId: TEST_ID_USE_HINT_ACTION,
    },
  ]
}

const TestView = (input: { model: Model; dispatch: (msg: Msg) => void; ctx: ModePlayFrontendCtx }) => {
  return (
    <ScreenLayout
      {...input}
      parentScreen={null}
      id='use-hint'
      renderBody={() => null}
      actionBar={{
        variant: {
          t: 'uniform',
          actions: viewAction(input),
        },
      }}
    />
  )
}

export const UseHintFrontend = {
  TEST_ID_USE_HINT_ACTION,
  viewAction,
  TestView,
}
