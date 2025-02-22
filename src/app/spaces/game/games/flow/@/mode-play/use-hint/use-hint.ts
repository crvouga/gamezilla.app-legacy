import { Eff } from '~/@/eff'
import { p } from '~/@/parser'
import { Flow } from '../../flow'
import { GroupId } from '../../flow/group-id'
import { NodeId } from '../../flow/node-id'
import { Terminal } from '../../flow/terminal'
import { AlgoIsSolved } from '../../solutions/algo-is-solved/algo-is-solved'
import { Solution } from '../../solutions/solution'
import { SolutionHash } from '../../solutions/solution-hash/solution-hash'
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
  const { msg } = input
  switch (msg.t) {
    case 'user-clicked-use-hint': {
      if (!('solutions' in msg)) return { model: input.model }

      const flow = toFlow(input.model, input.ctx.flow)

      const nextHintGroupId = toNextHintGroupId(flow)

      if (!nextHintGroupId) return { model: input.model }

      const solutionHash = SolutionHash.init(flow)

      const solution = msg.solutions[solutionHash]?.[0]

      if (!solution) return { model: input.model, events: [{ t: 'no-hints' }] }

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

      const flowNew = toFlow(modelNew, input.ctx.flow)

      if (AlgoIsSolved.isSolved(flowNew)) {
        return {
          model: modelNew,
          events: [{ t: 'solved' }, { t: 'used-hint', groupId: nextHintGroupId }],
        }
      }

      return {
        model: modelNew,
        events: [{ t: 'used-hint', groupId: nextHintGroupId }],
      }
    }

    default: {
      return { model: input.model }
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
  return { ...model, usedHints: {} }
}

export const toUsedHints = (
  model: Model,
): {
  [flowGroupId in GroupId]?: GroupId
} => {
  return model.usedHints
}

export const toFlow = (model: Model, flow: Variant.Model): Variant.Model => {
  return {
    ...flow,
    pipesBySourceId: model.pipesBySourceId,
    terminalsByGroupId: model.terminalsByGroupId,
  }
}
