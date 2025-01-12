import { pipe } from '~/@/function/pipe'
import { Translator } from '~/@/l18n/generated'
import { p } from '~/@/parser'
import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND, AppFrontendCmd, playSound, showToast } from '~/app/@/frontend/cmd'
import { IconCheckmark, Portal, Transition } from '~/app/@/ui'
import { BottomButtonInput } from '~/app/@/ui/bottom-buttons'
import { PrebuiltBottomButtons } from '../../../@/ui/prebuilt-bottom-buttons'
import { Flow } from '../flow'
import { AlgoDrawPipes } from '../flow/algo-draw-pipes'
import { GroupId } from '../flow/group-id'
import { NodeId } from '../flow/node-id'
import { Terminal } from '../flow/terminal'
import { AlgoSolve } from '../solutions/algo-solve'
import { Solutions } from '../solutions/solutions'
import { VariantBoard, type Variant } from '../variant'
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
  solutions: Solutions
}

export const initCtx = <TCtx,>(input: { flow: Variant.Model; solutions: Solutions } & TCtx): Ctx & TCtx => {
  return {
    ...UseHint.initCtx(input),
    ...input,
  }
}

const Idle = p.obj({ t: p.l('idle') })
type Idle = p.Infer<typeof Idle>

const Dragging = p.obj({
  t: p.l('dragging'),
  activeGroupId: GroupId,
  autocompleteEdge: p.maybe(Flow.Edge),
})
type Dragging = p.Infer<typeof Dragging>

const Status = p.or(Idle, Dragging)
type Status = p.Infer<typeof Status>

export const Model = p.and(
  UseHint.Model,
  p.obj({
    pipesBySourceId: p.dict(NodeId, Flow.Pipe),
    terminalsByGroupId: p.partialDict(GroupId, Terminal),
    status: Status,
    showCheckmarkAnimation: p.bool,
  }),
)
export type Model = p.Infer<typeof Model>

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
  const flow = toFlow(input)

  if (input.model.status.t === 'dragging') {
    const terminal = Flow.toTerminalByGroupId(flow, input.model.status.activeGroupId)
    if (!terminal?.endId) {
      if (Flow.isSolved(flow)) {
        return 'solved'
      }
      return 'solving'
    }

    return 'solving'
  }

  if (Flow.isSolved(flow)) {
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

const first = <T,>(iterable: Iterable<T>): T | null => {
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

export const Msg = p.or(
  UseHint.Msg,
  p.obj({
    t: p.l('user-clicked-reset'),
  }),
  p.obj({
    t: p.l('user-pressed-down-node'),
    nodeId: NodeId,
  }),
  p.obj({
    t: p.l('user-pressed-up-node'),
    nodeId: NodeId,
  }),
  p.obj({
    t: p.l('user-dragged-over-node'),
    nodeId: NodeId,
  }),
  p.obj({
    t: p.l('user-dragging-left'),
  }),
)

export type Msg = p.Infer<typeof Msg>

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

export const eventsToFrontendCmd = (
  { t }: { t: Translator },
  events?: Event[] | null,
): AppFrontendCmd<{
  MsgFrontend: never
  MsgToBackend: never
}>[] => {
  return (
    events?.map((event) => {
      switch (event.t) {
        case 'connected-terminals': {
          return playSound(APP_SOUND.tap)
        }

        case 'solved': {
          return playSound(APP_SOUND.celebration)
        }

        case 'started-dragging': {
          return playSound(APP_SOUND.tap)
        }

        case 'used-hint': {
          return playSound(APP_SOUND.navForwardMin)
        }

        case 'reset': {
          return playSound(APP_SOUND.navTransitionLeft)
        }

        case 'no-hints': {
          return playSound(APP_SOUND.alertErrorSm), showToast(t('flow-play.no-hints-available'))
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
        events: [
          {
            t: 'reset',
          },
        ],
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

const updateMain: typeof update = ({ model, ctx, msg }) => {
  switch (model.status.t) {
    case 'dragging': {
      return updateDragging({
        ctx,
        msg,
        model,
        modelStatus: model.status,
      })
    }

    case 'idle': {
      return updateIdle({
        ctx,
        msg,
        model,
      })
    }
  }
}

const updateIdle: typeof update = ({ msg, model, ctx }) => {
  switch (msg.t) {
    case 'user-pressed-down-node': {
      const current = toFlow({
        model,
        flow: ctx.flow,
      })

      const groupId = Flow.toGroupId(current, msg.nodeId)

      if (!groupId) {
        return {
          model,
        }
      }

      const started = AlgoDrawPipes.startDrawPipes(current, groupId, msg.nodeId)

      return {
        model: {
          ...model,
          terminalsByGroupId: started.terminalsByGroupId,
          pipesBySourceId: started.pipesBySourceId,
          status: { t: 'dragging', activeGroupId: groupId, autocompleteEdge: null },
        },
        events: [{ t: 'started-dragging' }],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

const updateDragging = ({
  msg,
  modelStatus,
  model,
  ctx,
}: {
  msg: Msg
  model: Model
  modelStatus: Dragging
  ctx: Ctx
}): {
  model: Model
  events?: Event[]
} => {
  switch (msg.t) {
    case 'user-dragged-over-node': {
      const current = toFlow({
        model,
        flow: ctx.flow,
      })

      const drew = AlgoDrawPipes.drawPipes(current, modelStatus.activeGroupId, msg.nodeId)

      const modelNew: Model = {
        ...model,
        status: model.status,
        terminalsByGroupId: drew.terminalsByGroupId,
        pipesBySourceId: drew.pipesBySourceId,
      }

      return {
        model: modelNew,
      }
    }

    case 'user-pressed-up-node': {
      const current = toFlow({
        model,
        flow: ctx.flow,
      })
      const modelNew: Model = {
        ...model,
        status: {
          t: 'idle',
        },
      }

      const activeGroupTerminal = Flow.toTerminalByGroupId(current, modelStatus.activeGroupId)

      if (!activeGroupTerminal) {
        return {
          model: modelNew,
        }
      }

      const isConnected = Flow.isConnectedWithPipes(current, activeGroupTerminal.startId, activeGroupTerminal.endId)

      const isSolved = Flow.isSolved(current)

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
      const current = toFlow({
        flow: ctx.flow,
        model,
      })
      const isSolved = Flow.isSolved(current)

      const terminal = Flow.toTerminalByGroupId(current, modelStatus.activeGroupId)

      if (!terminal?.endId) {
        return {
          model: { ...model, status: { t: 'idle' } },
        }
      }

      return {
        model: { ...model, status: { t: 'idle' } },
        events: isSolved ? [{ t: 'solved' }] : [],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

export const toFlow = (input: { flow: Variant.Model; model: Model }): Variant.Model => {
  const derived = UseHint.toFlow(input)
  return {
    ...derived,
    terminalsByGroupId: input.model.terminalsByGroupId,
  }
}

//
//
//
// View
//
//
//

export const View = (input: {
  flow: Variant.Model
  model: Model
  dispatch: (m: Msg) => void
  disabled?: boolean
  showSolvedAnimation?: boolean
}) => {
  const flow = toFlow(input)

  return (
    <>
      <VariantBoard.View
        disabled={input.disabled}
        model={flow}
        showCoordinates={false}
        isDragging={input.model.status.t === 'dragging'}
        onDraggedOver={(nodeId) => input.dispatch({ t: 'user-dragged-over-node', nodeId })}
        onPressDown={(nodeId) => input.dispatch({ t: 'user-pressed-down-node', nodeId })}
        onPressUp={(nodeId) => input.dispatch({ t: 'user-pressed-up-node', nodeId })}
        onLeave={() => input.dispatch({ t: 'user-dragging-left' })}
        autocompleteEdge={
          input.model.status.t === 'dragging' && input.model.status.autocompleteEdge
            ? { ...input.model.status.autocompleteEdge, groupId: input.model.status.activeGroupId }
            : null
        }
        isGroupActive={(groupId) => input.model.status.t === 'dragging' && input.model.status.activeGroupId === groupId}
        usedHints={UseHint.toUsedHints(input.model)}
      />

      <Portal.Entrance portalId='app-root'>
        <CheckmarkAnimation open={Boolean(input.model.showCheckmarkAnimation && input.showSolvedAnimation)} />
      </Portal.Entrance>
    </>
  )
}

export const viewHintAction = UseHint.viewUseHintAction

export const viewResetAction = (input: {
  flow: Variant.Model
  model: Model
  dispatch: (m: Msg) => void
  ctx: {
    t: Translator
  }
}): BottomButtonInput => {
  const flow = toFlow({
    model: input.model,
    flow: input.flow,
  })
  const disabled = Flow.isPipesEmpty(flow)
  return PrebuiltBottomButtons.reset({
    ctx: input.ctx,
    onClick: () => input.dispatch({ t: 'user-clicked-reset' }),
    disabled,
  })
}

const defaultCheckmarkAnimationDuration = TimeSpan.seconds(1 / 2)

const CheckmarkAnimation = (input: { open: boolean; duration?: TimeSpan | null | undefined }) => {
  const duration = input.duration ?? defaultCheckmarkAnimationDuration
  return (
    <Transition
      id='checkmark'
      onEnter={animateCheckmark({
        duration,
      })}
      onExit={async () => {}}
      mode='out-in'
      className='pointer-events-none'
    >
      {input.open && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0'>
          <IconCheckmark className='pointer-events-none aspect-square w-full opacity-50' />
        </div>
      )}
    </Transition>
  )
}

const animateCheckmark = (input: { duration: TimeSpan }) => async (node: HTMLElement) => {
  node.style.transition = 'all 0.3s ease-in-out'
  node.style.opacity = '0'
  node.style.transform = 'scale(0.8)'
  await new Promise((r) => setTimeout(r, 50))
  node.style.opacity = '1'
  node.style.transform = 'scale(1)'
  await new Promise((r) => setTimeout(r, TimeSpan.toMilliseconds(input.duration)))
  node.style.opacity = '0'
  node.style.transform = 'scale(0.8)'
}
