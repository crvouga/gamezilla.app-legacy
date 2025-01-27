import { Eff } from '~/@/eff'
import { p } from '~/@/parser'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { IconLightbulb } from '~/@/ui'
import { ScreenAction } from '~/app/@/ui/screen-actions'
import { Flow } from '../../flow'
import { GroupId } from '../../flow/group-id'
import { FlowHash } from '../../flow/hash'
import { NodeId } from '../../flow/node-id'
import { Terminal } from '../../flow/terminal'
import { Solution } from '../../solutions/solution'
import { Solutions } from '../../solutions/solutions'
import type { Variant } from '../../variant'

export type Ctx = {
  flow: Variant.Model
}

export const initCtx = (input: Ctx): Ctx => {
  return input
}

export const Model = p.obj({
  pipesBySourceId: p.dict(NodeId, Flow.Pipe),
  terminalsByGroupId: p.partialDict(GroupId, Terminal),
  usedHints: p.partialDict(GroupId, GroupId),
})
export type Model = p.Infer<typeof Model>

export const Msg = p.or(
  p.obj({
    t: p.l('user-clicked-use-hint'),
    solutions: Solutions,
  }),
)
export type Msg = p.Infer<typeof Msg>

export const init = (input: { ctx: Ctx }): Model => {
  return {
    pipesBySourceId: {},
    usedHints: {},
    terminalsByGroupId: input.ctx.flow.terminalsByGroupId,
  }
}

export type Event =
  | {
      t: 'solved'
    }
  | {
      t: 'used-hint'
      groupId: GroupId
    }
  | {
      t: 'no-hints'
    }

export const update = <TModel extends Model, TMsg extends { t: string & {} }>(input: {
  msg: Msg | TMsg
  model: TModel
  ctx: Ctx
}): {
  model: TModel
  events?: Event[]
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'user-clicked-use-hint': {
      const msg = input.msg as Msg

      const flow = toFlow({ flow: input.ctx.flow, model: input.model })

      const nextHintGroupId = toNextHintGroupId(flow)

      if (!nextHintGroupId) {
        return {
          model: input.model,
        }
      }

      const hash = FlowHash.init(flow)

      const solution = msg.solutions[hash]?.[0]

      if (!solution) {
        return {
          model: input.model,
          events: [
            {
              t: 'no-hints',
            },
          ],
        }
      }

      const solutionPipeline = Solution.toPipelineByGroupId(solution, nextHintGroupId)

      const addedSolution = Flow.addPipeline(flow, solutionPipeline)

      const modelNew: TModel = {
        ...input.model,
        pipesBySourceId: addedSolution.pipesBySourceId,
        terminalsByGroupId: {
          ...addedSolution.terminalsByGroupId,
          [nextHintGroupId]: addedSolution.terminalsByGroupId[nextHintGroupId],
        },
        usedHints: {
          ...input.model.usedHints,
          [nextHintGroupId]: nextHintGroupId,
        },
      }

      const flowNew = toFlow({
        flow,
        model: modelNew,
      })

      if (Flow.isSolved(flowNew)) {
        return {
          model: modelNew,
          events: [
            {
              t: 'solved',
            },
            {
              t: 'used-hint',
              groupId: nextHintGroupId,
            },
          ],
        }
      }

      return {
        model: modelNew,
        events: [
          {
            t: 'used-hint',
            groupId: nextHintGroupId,
          },
        ],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

export const toNextHintGroupId = (model: Flow.Model): GroupId | null => {
  for (const groupId of GroupId.ORDER) {
    if (!Flow.isTerminalConnectedWithPipes(model, groupId)) {
      return groupId
    }
  }
  return null
}

export const toShowingHintGroupIds = (model: Model): GroupId[] => {
  return Object.keys(model.usedHints).map((k) => k as GroupId)
}

export const isAnyShowingHint = (model: Model): boolean => {
  return toShowingHintGroupIds(model).length > 0
}

export const resetUsedHints = <TModel extends Model>(model: TModel): TModel => {
  return {
    ...model,
    usedHints: {},
  }
}

export const toUsedHints = (
  model: Model,
): {
  [flowGroupId in GroupId]?: GroupId
} => {
  return model.usedHints
}

export const toFlow = (input: { model: Model; flow: Variant.Model }): Variant.Model => {
  return {
    ...input.flow,
    pipesBySourceId: input.model.pipesBySourceId,
    terminalsByGroupId: input.model.terminalsByGroupId,
  }
}

export const viewUseHintAction = (input: {
  model: Model
  dispatch: (msg: Msg) => void
  ctx: AppFrontendCtx &
    Ctx & {
      solutions: Solutions
    }
  disabled: boolean
}): ScreenAction => {
  return {
    icon: (input) => <IconLightbulb {...input} />,
    label: input.ctx.t('game.hint'),
    onClick: () => {
      const flow = toFlow({ flow: input.ctx.flow, model: input.model })
      const hash = FlowHash.init(flow)
      const solutions = Solutions.limit(input.ctx.solutions, hash)
      input.dispatch({ t: 'user-clicked-use-hint', solutions })
    },
    disabled: input.disabled,
  }
}
