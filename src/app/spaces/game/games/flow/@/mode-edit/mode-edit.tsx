import { eq } from '~/@/equals/equals'
import { memoize } from '~/@/function/memoize'
import { History } from '~/@/history'
import { p } from '~/@/parser'
import { IconArrowRotateLeft, IconArrowRotateRight, IconExpand, IconXMark } from '~/@/ui'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { SurfaceLayout } from '~/app/@/ui/surface/layout'
import * as Flow from '../flow/flow'
import { GroupId } from '../flow/group-id'
import { NodeId } from '../flow/node-id'
import { Terminal } from '../flow/terminal'
import * as FlowUI from '../ui/color'
import { VariantBoard } from '../variant'
import * as FlowVariant from '../variant/variant'
import * as FlowVariantDimensions from '../variant/variant-dimensions'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/props'

//
//
//
// Model
//
//
//

const DraftTerminal = p.obj({
  groupId: GroupId,
  startId: NodeId,
  endId: p.maybe(NodeId),
})
type DraftTerminal = p.Infer<typeof DraftTerminal>

const DraftTerminals = p.partialDict(GroupId, DraftTerminal)
type DraftTerminals = p.Infer<typeof DraftTerminals>

const Form = p.obj({
  terminalsByGroupId: DraftTerminals,
  dimensions: FlowVariantDimensions.Model,
})
type Form = p.Infer<typeof Form>

const toEmptyForm = ({ flow }: { flow: FlowVariant.Model }): Form => {
  return {
    terminalsByGroupId: {},
    dimensions: FlowVariantDimensions.init(flow),
  }
}

export const Model = p.obj({
  form: History.parser(Form),
  opened: p.maybe(p.l('dimensions')),
  dimensions: FlowVariantDimensions.Model,
})
export type Model = p.Infer<typeof Model>

export const canClear = (model: Model): boolean => {
  return Object.keys(History.present(model.form).terminalsByGroupId).length > 0
}

export const init = ({ flow }: { flow: FlowVariant.Model }): Model => {
  const form: Form = {
    dimensions: FlowVariantDimensions.init(flow),
    terminalsByGroupId: flow.terminalsByGroupId,
  }
  return {
    form: History.init(form),
    dimensions: FlowVariantDimensions.init(flow),
    opened: null,
  }
}

export const isUnsavedChanges = (model: Model, flow: FlowVariant.Model): boolean => {
  const draft: Form = History.present(model.form)

  const actual: Form = {
    terminalsByGroupId: flow.terminalsByGroupId,
    dimensions: FlowVariantDimensions.init(flow),
  }

  const areTerminalsDifferent = !Flow.isSameTerminalsByGroupId(actual.terminalsByGroupId, draft.terminalsByGroupId)
  const areDimensionsDifferent = !eq(actual.dimensions, draft.dimensions)

  return areTerminalsDifferent || areDimensionsDifferent
}

//
//
//
// Update
//
//
//
export const Msg = p.or(
  p.obj({ t: p.l('dragged-over'), nodeId: NodeId }),
  p.obj({ t: p.l('pressed-up-node'), nodeId: NodeId }),
  p.obj({ t: p.l('pressed-down-node'), nodeId: NodeId }),
  p.obj({ t: p.l('clicked-clear') }),
  p.obj({ t: p.l('clicked-undo') }),
  p.obj({ t: p.l('clicked-redo') }),
  p.obj({ t: p.l('dimensions-form.clicked-open') }),
  p.obj({ t: p.l('dimensions-form.closed') }),
  p.obj({ t: p.l('dimensions-form.clicked-cancel') }),
  p.obj({ t: p.l('dimensions-form.clicked-save') }),
  p.obj({ t: p.l('dimensions-form.inputted'), dimensions: FlowVariantDimensions.Model }),
)
export type Msg = p.Infer<typeof Msg>

export type Cmd = {
  t: 'play-sound'
  sourceSrc: string
}

export const update = ({
  flow,
  model,
  msg,
}: {
  flow: FlowVariant.Model
  msg: Msg
  model: Model
}): {
  model: Model
  msgCmd?: Cmd
} => {
  switch (msg.t) {
    case 'dragged-over': {
      return {
        model,
      }
    }

    case 'pressed-up-node': {
      return {
        model,
      }
    }

    case 'clicked-clear': {
      return {
        model: {
          ...model,
          form: History.push(
            model.form,
            toEmptyForm({
              flow,
            }),
          ),
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navTransitionLeft,
        },
      }
    }

    case 'clicked-undo': {
      return {
        model: {
          ...model,
          form: History.undo(model.form),
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navBackwardMin,
        },
      }
    }

    case 'clicked-redo': {
      return {
        model: {
          ...model,
          form: History.redo(model.form),
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navForwardMin,
        },
      }
    }

    case 'pressed-down-node': {
      const currentPlacingGroupId = toCurrentPlacingGroupId(model)

      const draftTerminalsNew = updateDraftTerminalsOnPressedDownNode(
        History.present(model.form).terminalsByGroupId,
        currentPlacingGroupId,
        msg.nodeId,
      )

      return {
        model: {
          ...model,
          form: History.push(model.form, {
            ...History.present(model.form),
            terminalsByGroupId: draftTerminalsNew,
          }),
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.tap,
        },
      }
    }

    case 'dimensions-form.inputted': {
      return {
        model: {
          ...model,
          dimensions: msg.dimensions,
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.tap,
        },
      }
    }

    case 'dimensions-form.clicked-save': {
      const present = History.present(model.form)

      const flowNew = FlowVariant.init({
        dimensions: model.dimensions,
        terminalsByGroupId: present.terminalsByGroupId,
      })

      const formNew: Form = {
        terminalsByGroupId: flowNew.terminalsByGroupId,
        dimensions: FlowVariantDimensions.init(flowNew),
      }

      const modelNew: Model = {
        ...model,
        dimensions: FlowVariantDimensions.init(flowNew),
        form: History.push(model.form, formNew),
        opened: null,
      }

      return {
        model: modelNew,
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.refreshFeed,
        },
      }
    }

    case 'dimensions-form.clicked-open': {
      return {
        model: resetDimensionsForm({ ...model, opened: 'dimensions' }),
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.drawerOpened },
      }
    }

    case 'dimensions-form.closed': {
      return {
        model: resetDimensionsForm({ ...model, opened: null }),
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.drawerClosed },
      }
    }

    case 'dimensions-form.clicked-cancel': {
      return {
        model: resetDimensionsForm({ ...model, opened: null }),
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.drawerClosed },
      }
    }
  }
}

const canSubmitDimensionsForm = (model: Model): boolean => {
  const present = History.present(model.form)
  return !eq(present.dimensions, model.dimensions)
}

const resetDimensionsForm = (model: Model): Model => {
  const flow = toFlowMemoized({ model })
  return {
    ...model,
    dimensions: FlowVariantDimensions.init(flow),
  }
}

export const updateDraftTerminalsOnPressedDownNode = (
  draftTerminals: DraftTerminals,
  currentPlacingGroupId: GroupId,
  pressedNodeId: NodeId,
): DraftTerminals => {
  const pressedTerminal = findDraftTerminalByNodeId(draftTerminals, pressedNodeId)

  if (pressedTerminal) {
    if (pressedTerminal.startId === pressedNodeId) {
      if (!pressedTerminal.endId) {
        const draftTerminalsNew = {
          ...draftTerminals,
        }
        delete draftTerminalsNew[pressedTerminal.groupId]
        return draftTerminalsNew
      }
      const terminalNew: DraftTerminal = {
        groupId: pressedTerminal.groupId,
        startId: pressedTerminal.endId,
        endId: null,
      }
      return {
        ...draftTerminals,
        [pressedTerminal.groupId]: terminalNew,
      }
    }
    const terminalNew: DraftTerminal = {
      groupId: pressedTerminal.groupId,
      startId: pressedTerminal.startId,
      endId: null,
    }
    const draftTerminalsNew = {
      ...draftTerminals,
      [pressedTerminal.groupId]: terminalNew,
    }
    return draftTerminalsNew
  }

  const currentTerminal = draftTerminals[currentPlacingGroupId]

  if (!currentTerminal) {
    const terminalNew: DraftTerminal = {
      groupId: currentPlacingGroupId,
      startId: pressedNodeId,
      endId: null,
    }

    return {
      ...draftTerminals,
      [currentPlacingGroupId]: terminalNew,
    }
  }

  if (currentTerminal.groupId !== currentPlacingGroupId) {
    return draftTerminals
  }

  if (currentTerminal.startId === pressedNodeId) {
    return draftTerminals
  }

  const terminalNew: DraftTerminal = {
    groupId: currentPlacingGroupId,
    startId: currentTerminal.startId,
    endId: pressedNodeId,
  }

  return {
    ...draftTerminals,
    [currentPlacingGroupId]: terminalNew,
  }
}

const findDraftTerminalByNodeId = (draftTerminals: DraftTerminals, nodeId: NodeId): DraftTerminal | null => {
  for (const groupId in draftTerminals) {
    const draftTerminal = draftTerminals[groupId as GroupId]

    if (draftTerminal?.startId === nodeId) {
      return draftTerminal
    }

    if (draftTerminal?.endId === nodeId) {
      return draftTerminal
    }
  }
  return null
}

export const toCurrentPlacingGroupId = (model: Model): GroupId => {
  for (const groupId of GroupId.ORDER) {
    const draftTerminal = History.present(model.form).terminalsByGroupId[groupId]

    if (!draftTerminal) {
      return groupId
    }

    if (!draftTerminal.endId) {
      return groupId
    }
  }

  return GroupId.ORDER[GroupId.ORDER.length - 1]!
}

export const toCurrentPlacingTerminalPosition = (model: Model): 'start' | 'end' => {
  for (const groupId of GroupId.ORDER) {
    const draftTerminal = History.present(model.form).terminalsByGroupId[groupId]

    if (!draftTerminal) {
      return 'start'
    }

    if (!draftTerminal.endId) {
      return 'end'
    }
  }

  return 'start'
}

export const removeIncompleteTerminals = (draftTerminals: DraftTerminals): Flow.Model['terminalsByGroupId'] => {
  const terminalsByGroupId: Flow.Model['terminalsByGroupId'] = {}

  for (const groupId in draftTerminals) {
    const draftTerminal = draftTerminals[groupId as GroupId]
    if (!draftTerminal) {
      continue
    }
    if (!draftTerminal.endId) {
      continue
    }
    const terminal: Terminal = {
      startId: draftTerminal.startId,
      endId: draftTerminal.endId,
      groupId: draftTerminal.groupId,
    }
    terminalsByGroupId[draftTerminal.groupId] = terminal
  }
  return terminalsByGroupId
}

export const toFlow = ({ model }: { model: Model }): FlowVariant.Model => {
  const form = History.present(model.form)
  return FlowVariant.init({
    dimensions: model.dimensions,
    terminalsByGroupId: form.terminalsByGroupId,
  })
}

export const toFlowMemoized = memoize({
  func: toFlow,
  toKey(input) {
    return JSON.stringify(History.present(input.model.form))
  },
  cacheCapacity: 100,
})

//
//
//
// View
//
//
//

export const View = (input: {
  ctx: AppFrontendCtx
  model: Model
  dispatch: (m: Msg) => void
  screenLayout: Partial<ScreenLayoutProps>
  actions: ScreenAction[]
}) => {
  return (
    <ScreenLayout
      {...input.screenLayout}
      parentScreen={input.ctx.parentScreen}
      id='mode-edit-screen'
      ctx={input.ctx}
      actionBar={{
        variant: {
          t: 'uniform',
          actions: [
            ...input.actions,
            {
              icon: (input) => <IconArrowRotateLeft {...input} />,
              label: input.ctx.t('app.undo'),
              onClick: () => input.dispatch({ t: 'clicked-undo' }),
              disabled: !History.canUndo(input.model.form),
            },
            {
              icon: (input) => <IconArrowRotateRight {...input} />,
              label: input.ctx.t('app.redo'),
              disabled: !History.canRedo(input.model.form),
              onClick: () => input.dispatch({ t: 'clicked-redo' }),
            },
            {
              icon: (input) => <IconXMark {...input} />,
              label: input.ctx.t('app.clear'),
              disabled: !canClear(input.model),
              onClick: () => input.dispatch({ t: 'clicked-clear' }),
            },
            {
              icon: (input) => <IconExpand {...input} />,
              label: input.ctx.t('app.dimensions'),
              onClick: () => input.dispatch({ t: 'dimensions-form.clicked-open' }),
            },
          ],
        },
      }}
      renderBody={() => (
        <>
          <div className='flex w-full flex-1 flex-col items-center justify-center overflow-y-auto'>
            <ViewStatus {...input} />

            <VariantBoard.View
              model={toFlow(input)}
              onDraggedOver={(nodeId) => input.dispatch({ t: 'dragged-over', nodeId })}
              onPressDown={(nodeId) => input.dispatch({ t: 'pressed-down-node', nodeId })}
              onPressUp={(nodeId) => input.dispatch({ t: 'pressed-up-node', nodeId })}
            />
          </div>
          <SurfaceLayout
            id='dimensions'
            ctx={input.ctx}
            ariaLabel={input.ctx.t('app.dimensions')}
            open={input.model.opened === 'dimensions'}
            onClose={() => input.dispatch({ t: 'dimensions-form.closed' })}
            header={{
              title: input.ctx.t('app.dimensions'),
              onClose: () => input.dispatch({ t: 'dimensions-form.closed' }),
            }}
            form={{
              onSubmit: () => input.dispatch({ t: 'dimensions-form.clicked-save' }),
              onCancel: () => input.dispatch({ t: 'dimensions-form.clicked-cancel' }),
              cancelDisabled: false,
              cancelText: input.ctx.t('app.cancel'),
              submitText: input.ctx.t('app.save'),
              submitLoading: false,
              submitDisabled: !canSubmitDimensionsForm(input.model),
            }}
            renderBody={() => (
              <FlowVariantDimensions.ViewForm
                ctx={input.ctx}
                form={input.model.dimensions}
                onInput={(dimensions) => input.dispatch({ t: 'dimensions-form.inputted', dimensions })}
              />
            )}
          />
        </>
      )}
    />
  )
}

const ViewStatus: typeof View = (input) => {
  const position = toCurrentPlacingTerminalPosition(input.model) === 'start' ? 'first' : 'last'
  return (
    <div className='flex w-full items-center justify-center gap-1 p-2'>
      {`Placing ${position}`}
      <ViewTerminal groupId={toCurrentPlacingGroupId(input.model)} className='size-6' />
    </div>
  )
}

const ViewTerminal = ({ groupId, className }: { className: string; groupId: GroupId }) => {
  const color = FlowUI.Color.groupIdToHex(groupId)
  return (
    <svg className={className} viewBox='-1 -1 2 2'>
      <circle cx='0' cy='0' r='0.8' fill={color} />
    </svg>
  )
}
