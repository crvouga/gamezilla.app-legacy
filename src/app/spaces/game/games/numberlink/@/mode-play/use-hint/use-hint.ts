import { Eff } from '~/@/eff'
import { s } from '~/@/schema'
import { Flow } from '../../numberlink'
import { GroupId } from '../../numberlink/group-id'
import { NodeId } from '../../numberlink/node-id'
import { Terminal } from '../../numberlink/terminal'
import { AlgoIsSolved } from '../../solutions/algo-is-solved/algo-is-solved'
import { Solution } from '../../solutions/solution'
import { SolutionHash } from '../../solutions/solution-hash/solution-hash'
import { Solutions } from '../../solutions/solutions'
import type { Variant } from '../../variant'
import { TerminalFull } from '../../numberlink/terminal-full'

export type Ctx = {
  flow: Variant.Model
}

export const initCtx = (input: Ctx): Ctx => {
  return input
}

export const Model = s.obj({
  pipesBySourceId: s.dict(NodeId, Flow.Pipe),
  terminalsByGroupId: s.partialDict(GroupId, Terminal),
  usedHints: s.partialDict(GroupId, GroupId),
})
export type Model = s.Infer<typeof Model>

export const Msg = s.or(
  s.obj({
    t: s.l('user-clicked-use-hint'),
    solutions: Solutions,
  }),
)
export type Msg = s.Infer<typeof Msg>

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

      const solution = Solutions.selectOne(msg.solutions, solutionHash)

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
    if (hasFullTerminalForGroupId(model, groupId) && !Flow.isTerminalConnectedWithPipes(model, groupId)) {
      return groupId
    }
  }
  return null
}

const hasFullTerminalForGroupId = (model: Flow.Model, groupId: GroupId): boolean => {
  const terminal = model.terminalsByGroupId[groupId]
  if (!terminal) return false
  return TerminalFull.is(terminal)
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
