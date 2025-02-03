import { eq } from '~/@/equals/equals'
import { History } from '~/@/history'
import { p } from '~/@/parser'
import { IconArrowRotateLeft, IconArrowRotateRight, IconExpand, IconXMark } from '~/@/ui'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { Flow } from '../flow'
import { GroupId } from '../flow/group-id'
import { NodeId } from '../flow/node-id'
import { Color } from '../ui/color'
import { Variant, VariantBoard, VariantDimensions } from '../variant'

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
  dimensions: VariantDimensions.Model,
})
type Form = p.Infer<typeof Form>

const Opened = p.or(
  p.obj({
    t: p.l('dimensions'),
    draftDimensions: VariantDimensions.Model,
  }),
)

export type Opened = p.Infer<typeof Opened>

export const Model = p.obj({
  form: History.parser(Form),
  opened: p.maybe(Opened),
})
export type Model = p.Infer<typeof Model>

export const canClear = (model: Model): boolean => {
  return Object.keys(History.present(model.form).terminalsByGroupId).length > 0
}

export const init = (input: { flow: Variant.Model }): Model => {
  const form: Form = {
    dimensions: VariantDimensions.init(input.flow),
    terminalsByGroupId: input.flow.terminalsByGroupId,
  }
  return {
    form: History.init(form),
    opened: null,
  }
}

export const isUnsavedChanges = (model: Model, flow: Variant.Model): boolean => {
  const draft: Form = History.present(model.form)

  const actual: Form = {
    terminalsByGroupId: flow.terminalsByGroupId,
    dimensions: VariantDimensions.init(flow),
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
  p.obj({ t: p.l('dimensions-form.inputted'), dimensions: VariantDimensions.Model }),
)
export type Msg = p.Infer<typeof Msg>

export type Cmd = {
  t: 'play-sound'
  sourceSrc: string
}

export const update = (input: {
  flow: Variant.Model
  msg: Msg
  model: Model
}): {
  model: Model
  msgCmd?: Cmd
} => {
  switch (input.msg.t) {
    case 'dragged-over': {
      return { model: input.model }
    }

    case 'pressed-up-node': {
      return { model: input.model }
    }

    case 'clicked-clear': {
      const formNew: Form = {
        dimensions: History.present(input.model.form).dimensions,
        terminalsByGroupId: {},
      }
      return {
        model: {
          ...input.model,
          form: History.push(input.model.form, formNew),
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
          ...input.model,
          form: History.undo(input.model.form),
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
          ...input.model,
          form: History.redo(input.model.form),
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navForwardMin,
        },
      }
    }

    case 'pressed-down-node': {
      const currentPlacingGroupId = toCurrentPlacingGroupId(input.model)

      const draftTerminalsNew = updateDraftTerminalsOnPressedDownNode(
        History.present(input.model.form).terminalsByGroupId,
        currentPlacingGroupId,
        input.msg.nodeId,
      )

      return {
        model: {
          ...input.model,
          form: History.push(input.model.form, {
            ...History.present(input.model.form),
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
          ...input.model,
          opened: {
            t: 'dimensions',
            draftDimensions: input.msg.dimensions,
          },
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.tap,
        },
      }
    }

    case 'dimensions-form.clicked-save': {
      const opened = input.model.opened

      if (opened?.t !== 'dimensions') {
        return {
          model: input.model,
          msgCmd: {
            t: 'play-sound',
            sourceSrc: APP_SOUND.drawerClosed,
          },
        }
      }

      const present = History.present(input.model.form)

      const flowNew = Variant.init({
        dimensions: opened.draftDimensions,
        terminalsByGroupId: present.terminalsByGroupId,
      })

      const formNew: Form = {
        terminalsByGroupId: flowNew.terminalsByGroupId,
        dimensions: Variant.toDimensions(flowNew),
      }

      const modelNew: Model = {
        ...input.model,
        form: History.push(input.model.form, formNew),
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
      const present = History.present(input.model.form)
      return {
        model: {
          ...input.model,
          opened: { t: 'dimensions', draftDimensions: present.dimensions },
        },
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.drawerOpened },
      }
    }

    case 'dimensions-form.closed': {
      return {
        model: { ...input.model, opened: null },
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.drawerClosed },
      }
    }

    case 'dimensions-form.clicked-cancel': {
      return {
        model: {
          ...input.model,
          opened: null,
        },
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.drawerClosed },
      }
    }
  }
}

const canSubmitDimensionsForm = (model: Model): boolean => {
  const present = History.present(model.form)
  const opened = model.opened
  if (opened?.t !== 'dimensions') return false
  return !eq(opened.draftDimensions, present.dimensions)
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

export const toFlow = (model: Model): Variant.Model => {
  const form = History.present(model.form)
  const dimensions = model.opened?.draftDimensions ?? form.dimensions
  return Variant.init({
    dimensions,
    terminalsByGroupId: form.terminalsByGroupId,
  })
}

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
      renderBody={() => (
        <div className='flex w-full flex-1 flex-col items-center justify-center overflow-y-auto'>
          <ViewStatus {...input} />

          <VariantBoard.View
            model={toFlow(input.model)}
            onDraggedOver={(nodeId) => input.dispatch({ t: 'dragged-over', nodeId })}
            onPressDown={(nodeId) => input.dispatch({ t: 'pressed-down-node', nodeId })}
            onPressUp={(nodeId) => input.dispatch({ t: 'pressed-up-node', nodeId })}
          />
        </div>
      )}
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
              renderSurface: (anchor) => (
                <SurfaceLayout
                  id='dimensions'
                  ctx={input.ctx}
                  anchor={anchor}
                  ariaLabel={input.ctx.t('app.dimensions')}
                  open={input.model.opened?.t === 'dimensions'}
                  onClose={() => input.dispatch({ t: 'dimensions-form.closed' })}
                  dropDown={{
                    position: 'start',
                    alignment: 'ending',
                  }}
                  header={{
                    render: () => (
                      <SurfaceHeader
                        ctx={input.ctx}
                        title={input.ctx.t('app.dimensions')}
                        onClose={() => input.dispatch({ t: 'dimensions-form.closed' })}
                      />
                    ),
                  }}
                  form={{
                    onSubmit: () => input.dispatch({ t: 'dimensions-form.clicked-save' }),
                    onCancel: () => input.dispatch({ t: 'dimensions-form.clicked-cancel' }),
                    cancelDisabled: false,
                    cancelText: input.ctx.t('app.cancel'),
                    submitText: input.ctx.t('app.apply'),
                    submitLoading: false,
                    submitDisabled: !canSubmitDimensionsForm(input.model),
                  }}
                  body={{
                    render: () =>
                      input.model.opened?.draftDimensions && (
                        <VariantDimensions.ViewForm
                          ctx={input.ctx}
                          form={input.model.opened?.draftDimensions}
                          onInput={(dimensions) => input.dispatch({ t: 'dimensions-form.inputted', dimensions })}
                        />
                      ),
                  }}
                />
              ),
            },
          ],
        },
      }}
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
  const color = Color.groupIdToHex(groupId)
  return (
    <svg className={className} viewBox='-1 -1 2 2'>
      <circle cx='0' cy='0' r='0.8' fill={color} />
    </svg>
  )
}
