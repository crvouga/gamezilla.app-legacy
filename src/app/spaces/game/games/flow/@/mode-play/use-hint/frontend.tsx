import { IconLightbulb } from '~/@/ui'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SolutionHash } from '../../solutions/solution-hash/solution-hash'
import { Solutions } from '../../solutions/solutions'
import { ModePlayFrontendCtx } from '../frontend/ctx'
import { Model, Msg, toFlow } from './use-hint'

const TEST_ID = 'use-hint'

const isUseHintScreenAction = (action: ScreenAction): boolean => {
  return action.testId === TEST_ID
}

const viewUseHintAction = (input: {
  model: Model
  dispatch: (msg: Msg) => void
  ctx: ModePlayFrontendCtx
  disabled: boolean
}): ScreenAction[] => {
  if (!input.ctx.flow) return []
  const hash = SolutionHash.init(input.ctx.flow)
  const hasSolution = Solutions.selectOne(input.ctx.solutions, hash) !== null
  if (!hasSolution) return []
  return [
    {
      icon: (input) => <IconLightbulb {...input} />,
      label: input.ctx.t('game.hint'),
      onClick: () => {
        const flow = toFlow(input.model, input.ctx.flow)
        const hash = SolutionHash.init(flow)
        const solutions = Solutions.limit(input.ctx.solutions, hash)
        input.dispatch({ t: 'user-clicked-use-hint', solutions })
      },
      disabled: input.disabled,
      testId: TEST_ID,
    },
  ]
}

export const UseHintFrontend = {
  isUseHintScreenAction,
  viewUseHintAction,
}
