import { eq } from '~/@/equals/equals'
import { p } from '~/@/core/parser'
import { memoize } from '~/@/function/memoize'
import { History } from '~/@/history'
import { APP_SOUND, AppClientCtx } from '~/app/@/client'
import {
  Button,
  Drawer,
  DrawerHeader,
  IconArrowRotateLeft,
  IconArrowRotateRight,
  IconExpand,
  IconXMark
} from '~/app/@/ui'
import { ViewBottomButtonBar, ViewBottomButtonBarAction } from '~/app/@/ui/actions'
import { FlowLayout } from '../flow-ui/flow-layout'
import * as FlowUI from '../flow-ui/flow-ui'
import * as FlowVariant from '../flow-variant/flow-variant'
import * as FlowVariantDimensions from '../flow-variant/flow-variant-dimensions'
import * as FlowVariantUI from '../flow-variant/flow-variant-ui'
import * as Flow from '../flow/flow'
import { FlowGroupId } from '../flow/flow-group-id'
import { FlowNodeId } from '../flow/flow-node-id'
import { FlowTerminal } from '../flow/flow-terminal'

//
//
//
// Model
//
//
//

const DraftTerminal = p.obj({
  groupId: FlowGroupId,
  startId: FlowNodeId,
  endId: p.maybe(FlowNodeId)
})
type DraftTerminal = p.Infer<typeof DraftTerminal>

const DraftTerminals = p.partialDict(FlowGroupId, DraftTerminal)
type DraftTerminals = p.Infer<typeof DraftTerminals>

const Form = p.obj({
  terminalsByGroupId: DraftTerminals,
  dimensions: FlowVariantDimensions.Model
})
type Form = p.Infer<typeof Form>

const toEmptyForm = ({ flow }: { flow: FlowVariant.Model }): Form => {
  return {
    terminalsByGroupId: {},
    dimensions: FlowVariantDimensions.init(flow)
  }
}

export const Model = p.obj({
  form: History.parser(Form),
  opened: p.maybe(p.l('dimensions')),
  dimensions: FlowVariantDimensions.Model
})
export type Model = p.Infer<typeof Model>

export const canClear = (model: Model): boolean => {
  return Object.keys(History.present(model.form).terminalsByGroupId).length > 0
}

export const init = ({ flow }: { flow: FlowVariant.Model }): Model => {
  const form: Form = {
    dimensions: FlowVariantDimensions.init(flow),
    terminalsByGroupId: flow.terminalsByGroupId
  }
  return {
    form: History.init(form),
    dimensions: FlowVariantDimensions.init(flow),
    opened: null
  }
}

export const isUnsavedChanges = (model: Model, flow: FlowVariant.Model): boolean => {
  const draft: Form = History.present(model.form)

  const actual: Form = {
    terminalsByGroupId: flow.terminalsByGroupId,
    dimensions: FlowVariantDimensions.init(flow)
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
  p.obj({ t: p.l('dragged-over'), nodeId: FlowNodeId }),
  p.obj({ t: p.l('pressed-up-node'), nodeId: FlowNodeId }),
  p.obj({
    t: p.l('pressed-down-node'),
    nodeId: FlowNodeId
  }),
  p.obj({ t: p.l('clicked-clear') }),
  p.obj({ t: p.l('clicked-undo') }),
  p.obj({ t: p.l('clicked-redo') }),
  p.obj({ t: p.l('dimensions-form.clicked-open') }),
  p.obj({ t: p.l('dimensions-form.closed') }),
  p.obj({ t: p.l('dimensions-form.clicked-cancel') }),
  p.obj({ t: p.l('dimensions-form.clicked-save') }),
  p.obj({
    t: p.l('dimensions-form.inputted'),
    dimensions: FlowVariantDimensions.Model
  })
)
export type Msg = p.Infer<typeof Msg>

export type Cmd = {
  t: 'play-sound'
  sourceSrc: string
}

export const update = ({
  flow,
  model,
  msg
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
        model
      }
    }

    case 'pressed-up-node': {
      return {
        model
      }
    }

    case 'clicked-clear': {
      return {
        model: {
          ...model,
          form: History.push(
            model.form,
            toEmptyForm({
              flow
            })
          )
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navTransitionLeft
        }
      }
    }

    case 'clicked-undo': {
      return {
        model: {
          ...model,
          form: History.undo(model.form)
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navBackwardMin
        }
      }
    }

    case 'clicked-redo': {
      return {
        model: {
          ...model,
          form: History.redo(model.form)
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navForwardMin
        }
      }
    }

    case 'pressed-down-node': {
      const currentPlacingGroupId = toCurrentPlacingGroupId(model)

      const draftTerminalsNew = updateDraftTerminalsOnPressedDownNode(
        History.present(model.form).terminalsByGroupId,
        currentPlacingGroupId,
        msg.nodeId
      )

      return {
        model: {
          ...model,
          form: History.push(model.form, {
            ...History.present(model.form),
            terminalsByGroupId: draftTerminalsNew
          })
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.tap
        }
      }
    }

    case 'dimensions-form.inputted': {
      return {
        model: {
          ...model,
          dimensions: msg.dimensions
        },
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.tap
        }
      }
    }

    case 'dimensions-form.clicked-save': {
      const present = History.present(model.form)

      const flowNew = FlowVariant.init({
        dimensions: model.dimensions,
        terminalsByGroupId: present.terminalsByGroupId
      })

      const formNew: Form = {
        terminalsByGroupId: flowNew.terminalsByGroupId,
        dimensions: FlowVariantDimensions.init(flowNew)
      }

      const modelNew: Model = {
        ...model,
        dimensions: FlowVariantDimensions.init(flowNew),
        form: History.push(model.form, formNew),
        opened: null
      }

      return {
        model: modelNew,
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.refreshFeed
        }
      }
    }

    case 'dimensions-form.clicked-open': {
      return {
        model: resetDimensionsForm({
          ...model,
          opened: 'dimensions'
        }),
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navForwardMin
        }
      }
    }

    case 'dimensions-form.closed': {
      return {
        model: resetDimensionsForm({
          ...model,
          opened: null
        }),
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navBackwardMin
        }
      }
    }

    case 'dimensions-form.clicked-cancel': {
      return {
        model: resetDimensionsForm({
          ...model,
          opened: null
        }),
        msgCmd: {
          t: 'play-sound',
          sourceSrc: APP_SOUND.navBackwardMin
        }
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
    dimensions: FlowVariantDimensions.init(flow)
  }
}

export const updateDraftTerminalsOnPressedDownNode = (
  draftTerminals: DraftTerminals,
  currentPlacingGroupId: FlowGroupId,
  pressedNodeId: FlowNodeId
): DraftTerminals => {
  const pressedTerminal = findDraftTerminalByNodeId(draftTerminals, pressedNodeId)

  if (pressedTerminal) {
    if (pressedTerminal.startId === pressedNodeId) {
      if (!pressedTerminal.endId) {
        const draftTerminalsNew = {
          ...draftTerminals
        }
        delete draftTerminalsNew[pressedTerminal.groupId]
        return draftTerminalsNew
      }
      const terminalNew: DraftTerminal = {
        groupId: pressedTerminal.groupId,
        startId: pressedTerminal.endId,
        endId: null
      }
      return {
        ...draftTerminals,
        [pressedTerminal.groupId]: terminalNew
      }
    }
    const terminalNew: DraftTerminal = {
      groupId: pressedTerminal.groupId,
      startId: pressedTerminal.startId,
      endId: null
    }
    const draftTerminalsNew = {
      ...draftTerminals,
      [pressedTerminal.groupId]: terminalNew
    }
    return draftTerminalsNew
  }

  const currentTerminal = draftTerminals[currentPlacingGroupId]

  if (!currentTerminal) {
    const terminalNew: DraftTerminal = {
      groupId: currentPlacingGroupId,
      startId: pressedNodeId,
      endId: null
    }

    return {
      ...draftTerminals,
      [currentPlacingGroupId]: terminalNew
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
    endId: pressedNodeId
  }

  return {
    ...draftTerminals,
    [currentPlacingGroupId]: terminalNew
  }
}

const findDraftTerminalByNodeId = (draftTerminals: DraftTerminals, nodeId: FlowNodeId): DraftTerminal | null => {
  for (const groupId in draftTerminals) {
    const draftTerminal = draftTerminals[groupId as FlowGroupId]

    if (draftTerminal?.startId === nodeId) {
      return draftTerminal
    }

    if (draftTerminal?.endId === nodeId) {
      return draftTerminal
    }
  }
  return null
}

export const toCurrentPlacingGroupId = (model: Model): FlowGroupId => {
  for (const groupId of FlowGroupId.ORDER) {
    const draftTerminal = History.present(model.form).terminalsByGroupId[groupId]

    if (!draftTerminal) {
      return groupId
    }

    if (!draftTerminal.endId) {
      return groupId
    }
  }

  return FlowGroupId.ORDER[FlowGroupId.ORDER.length - 1]!
}

export const toCurrentPlacingTerminalPosition = (model: Model): 'start' | 'end' => {
  for (const groupId of FlowGroupId.ORDER) {
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
    const draftTerminal = draftTerminals[groupId as FlowGroupId]
    if (!draftTerminal) {
      continue
    }
    if (!draftTerminal.endId) {
      continue
    }
    const terminal: FlowTerminal = {
      startId: draftTerminal.startId,
      endId: draftTerminal.endId,
      groupId: draftTerminal.groupId
    }
    terminalsByGroupId[draftTerminal.groupId] = terminal
  }
  return terminalsByGroupId
}

export const toFlow = ({ model }: { model: Model }): FlowVariant.Model => {
  const form = History.present(model.form)
  return FlowVariant.init({
    dimensions: model.dimensions,
    terminalsByGroupId: form.terminalsByGroupId
  })
}

export const toFlowMemoized = memoize({
  func: toFlow,
  toKey(input) {
    return JSON.stringify(History.present(input.model.form))
  },
  cacheCapacity: 100
})

//
//
//
// View
//
//
//

export const View = (input: { ctx: AppClientCtx; model: Model; dispatch: (m: Msg) => void }) => {
  return (
    <FlowLayout
      top={
        <div className='flex flex-col items-center justify-end'>
          <ViewStatus {...input} />
        </div>
      }
      middle={
        <FlowVariantUI.View
          model={toFlow(input)}
          onDraggedOver={(nodeId) => input.dispatch({ t: 'dragged-over', nodeId })}
          onPressDown={(nodeId) => input.dispatch({ t: 'pressed-down-node', nodeId })}
          onPressUp={(nodeId) => input.dispatch({ t: 'pressed-up-node', nodeId })}
        />
      }
      bottom={
        <>
          <ViewBottomButtonBar>
            <ViewBottomButtonBarAction
              icon={(input) => <IconArrowRotateLeft {...input} />}
              label={input.ctx.t('app.undo')}
              onClick={() => input.dispatch({ t: 'clicked-undo' })}
              disabled={!History.canUndo(input.model.form)}
            />
            <ViewBottomButtonBarAction
              icon={(input) => <IconArrowRotateRight {...input} />}
              label={input.ctx.t('app.redo')}
              disabled={!History.canRedo(input.model.form)}
              onClick={() =>
                input.dispatch({
                  t: 'clicked-redo'
                })
              }
            />
            <ViewBottomButtonBarAction
              icon={(input) => <IconXMark {...input} />}
              label={input.ctx.t('app.clear')}
              disabled={!canClear(input.model)}
              onClick={() =>
                input.dispatch({
                  t: 'clicked-clear'
                })
              }
            />
            <ViewBottomButtonBarAction
              icon={(input) => <IconExpand {...input} />}
              label={input.ctx.t('app.dimensions')}
              onClick={() =>
                input.dispatch({
                  t: 'dimensions-form.clicked-open'
                })
              }
            />
          </ViewBottomButtonBar>
          <Drawer
            open={input.model.opened === 'dimensions'}
            onClose={() =>
              input.dispatch({
                t: 'dimensions-form.closed'
              })
            }
            id='dimensions'
            position='bottom'
          >
            <DrawerHeader
              onClose={() =>
                input.dispatch({
                  t: 'dimensions-form.closed'
                })
              }
            />

            <FlowVariantDimensions.ViewForm
              ctx={input.ctx}
              form={input.model.dimensions}
              onInput={(dimensions) =>
                input.dispatch({
                  t: 'dimensions-form.inputted',
                  dimensions
                })
              }
            />

            <div className='flex w-full items-center gap-4 p-4'>
              <Button
                text={input.ctx.t('app.cancel')}
                className='flex-1'
                onClick={() =>
                  input.dispatch({
                    t: 'dimensions-form.clicked-cancel'
                  })
                }
              />
              <Button
                text={input.ctx.t('app.save')}
                className='flex-1'
                variant='contained'
                color='primary'
                disabled={!canSubmitDimensionsForm(input.model)}
                onClick={() =>
                  input.dispatch({
                    t: 'dimensions-form.clicked-save'
                  })
                }
              />
            </div>
          </Drawer>
        </>
      }
    />
  )
}

const ViewStatus: typeof View = (input) => {
  const position = toCurrentPlacingTerminalPosition(input.model) === 'start' ? 'first' : 'last'
  return (
    <div className='flex w-full items-center justify-center gap-1 p-2'>
      {`Placing ${position}`}
      <ViewTerminal groupId={toCurrentPlacingGroupId(input.model)} className='h-6 w-6' />
    </div>
  )
}

const ViewTerminal = ({ groupId, className }: { className: string; groupId: FlowGroupId }) => {
  const color = FlowUI.Color.groupIdToHex(groupId)
  return (
    <svg className={className} viewBox='-1 -1 2 2'>
      <circle cx='0' cy='0' r='0.8' fill={color} />
    </svg>
  )
}
