import { eq } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import type { AppClientCtx } from 'gamezilla-app/app/@/client'
import { IconLightbulb } from 'gamezilla-app/app/@/ui'
import type { ActionInput } from 'gamezilla-app/app/@/ui/actions'
import type { FlowPuzzle } from '../../../puzzle/puzzle'
import { Flow } from '../../flow'
import type { FlowVariant } from '../../flow-variant'
import { FlowGroupId } from '../../flow/flow-group-id'
import { FlowNodeId } from '../../flow/flow-node-id'
import { FlowTerminal } from '../../flow/flow-terminal'

type Ctx = {
  flowPuzzle: FlowPuzzle
}

export const Model = p.obj({
  pipesBySourceId: p.dict(FlowNodeId, Flow.Pipe),
  terminalsByGroupId: p.partialDict(FlowGroupId, FlowTerminal),
  usedHints: p.partialDict(FlowGroupId, FlowGroupId)
})
export type Model = p.Infer<typeof Model>

export const Msg = p.or(
  p.obj({
    t: p.l('user-clicked-use-hint')
  })
)
export type Msg = p.Infer<typeof Msg>

export const init = (input: { ctx: Ctx }): Model => {
  return {
    pipesBySourceId: {},
    usedHints: {},
    terminalsByGroupId: input.ctx.flowPuzzle.flow.terminalsByGroupId
  }
}

export type Event =
  | {
      t: 'solved'
    }
  | {
      t: 'used-hint'
      groupId: FlowGroupId
    }
  | {
      t: 'no-hints'
    }

export const update = <TModel extends Model, TMsg extends { t: string & {} }>(input: {
  msg: Msg | TMsg
  model: TModel
  ctx: {
    flowPuzzle: FlowPuzzle
  }
}): {
  model: TModel
  events?: Event[]
} => {
  switch (input.msg.t) {
    case 'user-clicked-use-hint': {
      const flow = toFlow({
        flow: input.ctx.flowPuzzle.flow,
        model: input.model
      })

      const nextHintGroupId = toNextHintGroupId(flow)

      if (!nextHintGroupId) {
        return {
          model: input.model
        }
      }

      const terminalFlowPuzzle = Flow.toTerminalByGroupId(input.ctx.flowPuzzle.flow, nextHintGroupId)
      const terminalFlowModel = Flow.toTerminalByGroupId(flow, nextHintGroupId)

      const solution =
        input.ctx.flowPuzzle.solutions.length > 0 && eq(terminalFlowPuzzle, terminalFlowModel)
          ? input.ctx.flowPuzzle.solutions[0]
          : null

      if (!solution) {
        return {
          model: input.model,
          events: [
            {
              t: 'no-hints'
            }
          ]
        }
      }

      const solutionPipeline = Flow.toPipelineFromGroupId(solution, nextHintGroupId)

      const solutionTerminal = Flow.toTerminalByGroupId(solution, nextHintGroupId)

      const addedSolution = Flow.addPipeline(flow, solutionPipeline)

      const modelNew: TModel = {
        ...input.model,
        pipesBySourceId: addedSolution.pipesBySourceId,
        terminalsByGroupId: {
          ...input.model.terminalsByGroupId,
          [nextHintGroupId]: solutionTerminal ?? input.model.terminalsByGroupId[nextHintGroupId]
        },
        usedHints: {
          ...input.model.usedHints,
          [nextHintGroupId]: nextHintGroupId
        }
      }

      const flowNew = toFlow({
        flow,
        model: modelNew
      })

      if (Flow.isSolved(flowNew)) {
        return {
          model: modelNew,
          events: [
            {
              t: 'solved'
            },
            {
              t: 'used-hint',
              groupId: nextHintGroupId
            }
          ]
        }
      }

      return {
        model: modelNew,
        events: [
          {
            t: 'used-hint',
            groupId: nextHintGroupId
          }
        ]
      }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

export const toNextHintGroupId = (model: Flow.Model): FlowGroupId | null => {
  for (const groupId of FlowGroupId.ORDER) {
    if (!Flow.isTerminalConnectedWithPipes(model, groupId)) {
      return groupId
    }
  }
  return null
}

export const toShowingHintGroupIds = (model: Model): FlowGroupId[] => {
  return Object.keys(model.usedHints).map((k) => k as FlowGroupId)
}

export const isAnyShowingHint = (model: Model): boolean => {
  return toShowingHintGroupIds(model).length > 0
}

export const resetUsedHints = <TModel extends Model>(model: TModel): TModel => {
  return {
    ...model,
    usedHints: {}
  }
}

export const toUsedHints = (
  model: Model
): {
  [flowGroupId in FlowGroupId]?: FlowGroupId
} => {
  return model.usedHints
}

export const toFlow = (input: { model: Model; flow: FlowVariant.Model }): FlowVariant.Model => {
  return {
    ...input.flow,
    pipesBySourceId: input.model.pipesBySourceId,
    terminalsByGroupId: input.model.terminalsByGroupId
  }
}

export const viewUseHintAction = (input: {
  model: Model
  dispatch: (msg: Msg) => void
  ctx: AppClientCtx & Ctx
  disabled: boolean
}): ActionInput => {
  return {
    icon: (input) => <IconLightbulb {...input} />,
    label: input.ctx.t('game.hint'),
    onClick: () => input.dispatch({ t: 'user-clicked-use-hint' }),
    disabled: input.disabled
  }
}
