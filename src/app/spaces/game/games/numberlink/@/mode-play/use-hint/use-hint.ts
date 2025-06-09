import { Eff } from '~/@/eff'
import { s } from '~/@/schema'
import { Numberlink } from '../../numberlink'
import { GroupId } from '../../numberlink/group-id'
import { NodeId } from '../../numberlink/node-id'
import { Terminal } from '../../numberlink/terminal'
import { AlgoIsSolved } from '../../solutions/algo-is-solved/algo-is-solved'
import { Solution } from '../../solutions/solution'
import { SolutionHash } from '../../solutions/solution-hash/solution-hash'
import { Solutions } from '../../solutions/solutions'
import type { NumberlinkVariant } from '../../variant'
import { TerminalFull } from '../../numberlink/terminal-full'

export type Ctx = {
  numberlink: NumberlinkVariant.Model
}

export const initCtx = (input: Ctx): Ctx => {
  return input
}

export const Model = s.obj({
  pipesBySourceId: s.dict(NodeId, Numberlink.Pipe),
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
    terminalsByGroupId: input.ctx.numberlink.terminalsByGroupId,
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

      const numberlink = toNumberlink(input.model, input.ctx.numberlink)

      const nextHintGroupId = toNextHintGroupId(numberlink)

      if (!nextHintGroupId) return { model: input.model }

      const solutionHash = SolutionHash.init(numberlink)

      const solution = Solutions.selectOne(msg.solutions, solutionHash)

      if (!solution) return { model: input.model, events: [{ t: 'no-hints' }] }

      const solutionPipeline = Solution.toPipelineByGroupId(solution, nextHintGroupId)

      const addedSolution = Numberlink.addPipeline(numberlink, solutionPipeline)

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

      const numberlinkNew = toNumberlink(modelNew, input.ctx.numberlink)

      if (AlgoIsSolved.isSolved(numberlinkNew)) {
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

export const toNextHintGroupId = (model: Numberlink.Model): GroupId | null => {
  for (const groupId of GroupId.ORDER) {
    if (hasFullTerminalForGroupId(model, groupId) && !Numberlink.isTerminalConnectedWithPipes(model, groupId)) {
      return groupId
    }
  }
  return null
}

const hasFullTerminalForGroupId = (model: Numberlink.Model, groupId: GroupId): boolean => {
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

export const toNumberlink = (model: Model, numberlink: NumberlinkVariant.Model): NumberlinkVariant.Model => {
  return {
    ...numberlink,
    pipesBySourceId: model.pipesBySourceId,
    terminalsByGroupId: model.terminalsByGroupId,
  }
}
