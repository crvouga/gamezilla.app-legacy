import { pipe } from '~/@/function/pipe'
import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd'
import { Flow } from '../numberlink'
import { GroupId } from '../numberlink/group-id'
import { NodeId } from '../numberlink/node-id'
import { Terminal } from '../numberlink/terminal'
import { AlgoIsSolved } from '../solutions/algo-is-solved/algo-is-solved'
import { AlgoSolve } from '../solutions/algo-solve'
import { Solutions } from '../solutions/solutions'
import { type Variant } from '../variant'
import { AlgoDrawPipes } from './algo-draw-pipes'
import { UseHint } from './use-hint'

//
//
//
// Model
//
//
//

export type Ctx = UseHint.Ctx & {
  flow: Variant.Model
}

export const initCtx = <TCtx>(input: { flow: Variant.Model } & TCtx): Ctx & TCtx => {
  return {
    ...UseHint.initCtx(input),
    ...input,
  }
}

const Idle = s.obj({ t: s.l('idle') })
type Idle = s.Infer<typeof Idle>

const Dragging = s.obj({
  t: s.l('dragging'),
  activeGroupId: GroupId,
  autocompleteEdge: s.maybe(Flow.Edge),
})
type Dragging = s.Infer<typeof Dragging>

const Status = s.or(Idle, Dragging)
type Status = s.Infer<typeof Status>

export const Model = s.and(
  UseHint.Model,
  s.obj({
    pipesBySourceId: s.dict(NodeId, Flow.Pipe),
    terminalsByGroupId: s.partialDict(GroupId, Terminal),
    status: Status,
    showCheckmarkAnimation: s.bool,
  }),
)
export type Model = s.Infer<typeof Model>

export const init = (input: { ctx: Ctx }): Model => {
  return {
    ...UseHint.init(input),
    pipesBySourceId: {
      ...input.ctx.flow.pipesBySourceId,
    },
    terminalsByGroupId: {
      ...input.ctx.flow.terminalsByGroupId,
    },
    status: { t: 'idle' },
    showCheckmarkAnimation: false,
  }
}

export const toStatus = (input: { flow: Variant.Model; model: Model }) => {
  const flow = toFlow(input.model, input.flow)

  if (input.model.status.t === 'dragging') {
    const terminal = Flow.toTerminalByGroupId(flow, input.model.status.activeGroupId)
    if (!terminal?.endId) {
      if (AlgoIsSolved.isSolved(flow)) {
        return 'solved'
      }
      return 'solving'
    }

    return 'solving'
  }

  if (AlgoIsSolved.isSolved(flow)) {
    return 'solved'
  }

  return 'solving'
}

export const random = (input: { flow: Variant.Model; solutions: Solutions }): Model => {
  const initial = init({ ctx: initCtx(input) })

  const terminal = Flow.randomTerminal(input.flow)

  if (!terminal) {
    return initial
  }

  const edge = Flow.randomOutEdge(input.flow, terminal.startId)

  if (!edge) {
    return initial
  }

  return {
    ...initial,
    pipesBySourceId: {
      [terminal.startId]: {
        edgeId: Flow.toEdgeId(edge),
        groupId: terminal.groupId,
      },
    },
    terminalsByGroupId: {
      [terminal?.groupId]: terminal,
    },
  }
}

export const randomMsgs = ({ flow }: { flow: Flow.Model }): Msg[] => {
  const terminal = Flow.randomTerminal(flow)

  if (!terminal) {
    return []
  }

  const edges: Flow.Edge[] = []

  const currentNodeId: NodeId = terminal.startId

  for (let i = 0; i < Math.random() * 10; i++) {
    const edge = Flow.randomOutEdge(flow, currentNodeId)

    if (!edge) {
      break
    }

    edges.push(edge)
  }

  const msgs: Msg[] = [
    {
      t: 'user-pressed-down-node',
      nodeId: terminal.startId,
    },
    ...edges.map(
      (edge): Msg => ({
        t: 'user-dragged-over-node',
        nodeId: edge.targetId,
      }),
    ),
  ]

  return msgs
}

export const isShowingHint = (_model: Model): boolean => {
  return false
}

export const toSolutionMsgs = ({ flow }: { flow: Variant.Model }): Msg[] => {
  const solutions = AlgoSolve.solutions(flow)

  const solution = first(solutions)

  if (!solution) {
    return []
  }

  const msgs: Msg[] = []

  for (const terminal of Flow.toTerminals(solution)) {
    if (!terminal.endId) {
      continue
    }

    msgs.push({
      t: 'user-pressed-down-node',
      nodeId: terminal.startId,
    })

    for (const pipe of Flow.toPipeline(solution, terminal.startId)) {
      const edge = Flow.toEdge(solution, pipe.edgeId)
      if (!edge) {
        continue
      }
      msgs.push({
        t: 'user-dragged-over-node',
        nodeId: edge.targetId,
      })
    }

    msgs.push({
      t: 'user-pressed-up-node',
      nodeId: terminal.endId,
    })
  }

  return msgs
}

const first = <T>(iterable: Iterable<T>): T | null => {
  for (const item of iterable) {
    return item
  }
  return null
}

//
//
//
//
//
//

export const Msg = s.or(
  UseHint.Msg,
  s.obj({
    t: s.l('user-clicked-reset'),
  }),
  s.obj({
    t: s.l('user-pressed-down-node'),
    nodeId: NodeId,
  }),
  s.obj({
    t: s.l('user-pressed-up-node'),
    nodeId: NodeId,
  }),
  s.obj({
    t: s.l('user-dragged-over-node'),
    nodeId: NodeId,
  }),
  s.obj({
    t: s.l('user-dragging-left'),
  }),
)

export type Msg = s.Infer<typeof Msg>

export type Event =
  | UseHint.Event
  | {
      t: 'started-dragging'
    }
  | {
      t: 'connected-terminals'
      connectedTerminalCount: number
    }
  | {
      t: 'solved'
    }
  | {
      t: 'reset'
    }

export const eventsToFrontendCmd = ({ t }: { t: Translator }, events?: Event[] | null): unknown[] => {
  return (
    events?.map((event) => {
      switch (event.t) {
        case 'connected-terminals': {
          return [PlaySoundCmd.init(APP_SOUND.tap)]
        }

        case 'solved': {
          return [PlaySoundCmd.init(APP_SOUND.celebration)]
        }

        case 'started-dragging': {
          return [PlaySoundCmd.init(APP_SOUND.tap)]
        }

        case 'used-hint': {
          return [PlaySoundCmd.init(APP_SOUND.navForwardMin)]
        }

        case 'reset': {
          return [PlaySoundCmd.init(APP_SOUND.navTransitionLeft)]
        }

        case 'no-hints': {
          return [PlaySoundCmd.init(APP_SOUND.alertErrorSm), ShowToastCmd.init(t('flow-play.no-hints-available'))]
        }
      }
    }) ?? []
  )
}

export const update = (input: {
  msg: Msg
  model: Model
  ctx: Ctx
}): {
  model: Model
  events?: Event[]
} => {
  const updatedMain = updateMain(input)

  const updatedHint = UseHint.update({ ...input, model: updatedMain.model })

  const updatedReset = updateReset({ ...input, model: updatedHint.model })

  const events = [...(updatedMain?.events ?? []), ...(updatedHint?.events ?? []), ...(updatedReset?.events ?? [])]

  const updated = updateShowCheckmarkAnimation({ model: updatedReset.model, events })

  return {
    events,
    model: updated,
  }
}

const updateShowCheckmarkAnimation = (input: { model: Model; events: Event[] }): Model => {
  if (input.events?.some((event) => event.t === 'solved')) {
    return {
      ...input.model,
      showCheckmarkAnimation: true,
    }
  }

  return {
    ...input.model,
    showCheckmarkAnimation: false,
  }
}

const resetPipes = (model: Model): Model => {
  return {
    ...model,
    pipesBySourceId: {},
  }
}

const updateReset: typeof update = ({ model, msg }) => {
  switch (msg.t) {
    case 'user-clicked-reset': {
      return {
        model: pipe(model, resetPipes, UseHint.resetUsedHints),
        events: [{ t: 'reset' }],
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

const updateMain: typeof update = (input) => {
  switch (input.model.status.t) {
    case 'dragging': {
      return updateDragging({ ...input, modelStatus: input.model.status })
    }

    case 'idle': {
      return updateIdle(input)
    }
  }
}

const updateIdle: typeof update = (input) => {
  switch (input.msg.t) {
    case 'user-pressed-down-node': {
      const current = toFlow(input.model, input.ctx.flow)

      const groupId = Flow.toGroupId(current, input.msg.nodeId)

      if (!groupId) return { model: input.model }

      const started = AlgoDrawPipes.startDrawPipes(current, groupId, input.msg.nodeId)

      return {
        model: {
          ...input.model,
          terminalsByGroupId: started.terminalsByGroupId,
          pipesBySourceId: started.pipesBySourceId,
          status: { t: 'dragging', activeGroupId: groupId, autocompleteEdge: null },
        },
        events: [{ t: 'started-dragging' }],
      }
    }

    default: {
      return { model: input.model }
    }
  }
}

const updateDragging = (input: {
  msg: Msg
  model: Model
  modelStatus: Dragging
  ctx: Ctx
}): {
  model: Model
  events?: Event[]
} => {
  switch (input.msg.t) {
    case 'user-dragged-over-node': {
      const current = toFlow(input.model, input.ctx.flow)

      const drew = AlgoDrawPipes.drawPipes(current, input.modelStatus.activeGroupId, input.msg.nodeId)

      const modelNew: Model = {
        ...input.model,
        status: input.model.status,
        terminalsByGroupId: drew.terminalsByGroupId,
        pipesBySourceId: drew.pipesBySourceId,
      }

      return { model: modelNew }
    }

    case 'user-pressed-up-node': {
      const current = toFlow(input.model, input.ctx.flow)
      const modelNew: Model = {
        ...input.model,
        status: {
          t: 'idle',
        },
      }

      const activeGroupTerminal = Flow.toTerminalByGroupId(current, input.modelStatus.activeGroupId)

      if (!activeGroupTerminal) return { model: modelNew }

      const isConnected = Flow.isConnectedWithPipes(current, activeGroupTerminal.startId, activeGroupTerminal.endId)

      const isSolved = AlgoIsSolved.isSolved(current)

      if (isSolved && isConnected) {
        return {
          model: modelNew,
          events: [
            {
              t: 'solved',
            },
          ],
        }
      }

      if (isConnected) {
        return {
          model: modelNew,
          events: [{ t: 'connected-terminals', connectedTerminalCount: Flow.countConnectedPipes(current) }],
        }
      }

      return {
        model: modelNew,
      }
    }

    case 'user-dragging-left': {
      const current = toFlow(input.model, input.ctx.flow)
      const isSolved = AlgoIsSolved.isSolved(current)

      const terminal = Flow.toTerminalByGroupId(current, input.modelStatus.activeGroupId)

      if (!terminal?.endId) {
        return {
          model: { ...input.model, status: { t: 'idle' } },
        }
      }

      return {
        model: { ...input.model, status: { t: 'idle' } },
        events: isSolved ? [{ t: 'solved' }] : [],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

export const toFlow = (model: Model, flow: Variant.Model): Variant.Model => {
  const derived = UseHint.toFlow(model, flow)
  return {
    ...derived,
    terminalsByGroupId: model.terminalsByGroupId,
  }
}
