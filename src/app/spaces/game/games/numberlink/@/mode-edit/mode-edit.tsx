import { eq } from '~/@/equals/equals'
import { History } from '~/@/history'
import { s } from '~/@/schema'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { Flow } from '../numberlink'
import { GroupId } from '../numberlink/group-id'
import { NodeId } from '../numberlink/node-id'
import { Variant, VariantDimensions } from '../variant'

//
//
//
// Model
//
//
//

const DraftTerminal = s.obj({
  groupId: GroupId,
  startId: NodeId,
  endId: s.maybe(NodeId),
})
type DraftTerminal = s.Infer<typeof DraftTerminal>

const DraftTerminals = s.partialDict(GroupId, DraftTerminal)
type DraftTerminals = s.Infer<typeof DraftTerminals>

const Form = s.obj({
  terminalsByGroupId: DraftTerminals,
  dimensions: VariantDimensions.Model,
})
type Form = s.Infer<typeof Form>

const Opened = s.or(
  s.obj({
    t: s.l('dimensions'),
    draftDimensions: VariantDimensions.Model,
  }),
)

export type Opened = s.Infer<typeof Opened>

export const Model = s.obj({
  form: History.schema(Form),
  opened: s.maybe(Opened),
  hoveredNodeId: s.maybe(NodeId),
})
export type Model = s.Infer<typeof Model>

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
    hoveredNodeId: null,
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
export const Msg = s.or(
  s.obj({ t: s.l('dragged-over'), nodeId: NodeId }),
  s.obj({ t: s.l('pressed-up-node'), nodeId: NodeId }),
  s.obj({ t: s.l('pressed-down-node'), nodeId: NodeId }),
  s.obj({ t: s.l('hovered-over-node'), nodeId: NodeId }),
  s.obj({ t: s.l('clicked-clear') }),
  s.obj({ t: s.l('clicked-undo') }),
  s.obj({ t: s.l('clicked-redo') }),
  s.obj({ t: s.l('dimensions-form.clicked-open') }),
  s.obj({ t: s.l('dimensions-form.closed') }),
  s.obj({ t: s.l('dimensions-form.clicked-cancel') }),
  s.obj({ t: s.l('dimensions-form.clicked-save') }),
  s.obj({ t: s.l('dimensions-form.inputted'), dimensions: VariantDimensions.Model }),
)
export type Msg = s.Infer<typeof Msg>

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

    case 'hovered-over-node': {
      return { model: { ...input.model, hoveredNodeId: input.msg.nodeId } }
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
            sourceSrc: APP_SOUND.surfaceClosed,
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
      const isOpen = input.model.opened?.t === 'dimensions'

      if (isOpen) {
        return {
          model: { ...input.model, opened: null },
          msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.surfaceClosed },
        }
      }

      return {
        model: {
          ...input.model,
          opened: { t: 'dimensions', draftDimensions: present.dimensions },
        },
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.surfaceOpened },
      }
    }

    case 'dimensions-form.closed': {
      return {
        model: { ...input.model, opened: null },
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.surfaceClosed },
      }
    }

    case 'dimensions-form.clicked-cancel': {
      return {
        model: {
          ...input.model,
          opened: null,
        },
        msgCmd: { t: 'play-sound', sourceSrc: APP_SOUND.surfaceClosed },
      }
    }
  }
}

export const canSubmitDimensionsForm = (model: Model): boolean => {
  const present = History.present(model.form)
  const opened = model.opened
  if (opened?.t !== 'dimensions') return false
  return !eq(opened.draftDimensions, present.dimensions)
}

export const hasGhostTerminal = (model: Model, nodeId: NodeId): boolean => {
  return model.hoveredNodeId === nodeId
}

const updateDraftTerminalsOnPressedDownNode = (
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
