import { FlowSpaceCtx } from '../../@/space/ctx'
import { EditMode } from '../../@/edit-mode'
import { PlayMode } from '../../@/play-mode'
import { Variant } from '../../@/variant'
import * as BuilderTypes from '../types'
import { DeleteForeverSpace } from './drawer-delete-forever/space'
import { EditPuzzleNameSpace } from './drawer-edit-puzzle-name/space'
import { SaveChangesSpace } from './drawer-save-changes/space'
import { ModelSpace } from './types'

const toStatus = (modelSpace: ModelSpace): 'solving' | 'solved' => {
  return PlayMode.toStatus({ model: modelSpace.playMode, flow: toFlow(modelSpace) })
}

const toFlow = (modelSpace: ModelSpace): Variant.Model => {
  switch (modelSpace.mode.t) {
    case 'edit': {
      return EditMode.toFlow({ model: modelSpace.editMode })
    }

    case 'play': {
      return PlayMode.toFlow({ flow: EditMode.toFlow({ model: modelSpace.editMode }), model: modelSpace.playMode })
    }
  }
}

const updateSpaceMain = ({
  modelSpace,
  msgSpace,
  ctx,
}: {
  ctx: FlowSpaceCtx
  msgSpace: BuilderTypes.MsgSpace
  modelSpace: BuilderTypes.ModelSpace
}): BuilderTypes.ModelSpace => {
  switch (msgSpace.t) {
    case 'screen-puzzle-builder.got-play-msg': {
      if (!modelSpace.screenPuzzleBuilder) {
        return modelSpace
      }

      const flow = EditMode.toFlowMemoized({
        model: modelSpace.screenPuzzleBuilder.editMode,
      })

      const updated = PlayMode.update({
        model: modelSpace.screenPuzzleBuilder.playMode,
        msg: msgSpace.c,
        ctx: PlayMode.initCtx({ flow, solutions: ctx.solutions }),
      })

      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          playMode: updated.model,
        },
      }
    }

    case 'screen-puzzle-builder.got-edit-msg': {
      if (!modelSpace.screenPuzzleBuilder) {
        return modelSpace
      }

      const updated = EditMode.update({
        model: modelSpace.screenPuzzleBuilder.editMode,
        msg: msgSpace.c,
        flow: modelSpace.screenPuzzleBuilder.puzzle.flow,
      })

      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          editMode: updated.model,
        },
      }
    }

    case 'screen-puzzle-builder.user-clicked-edit-mode-button': {
      if (!modelSpace.screenPuzzleBuilder) {
        return modelSpace
      }

      if (msgSpace.userId !== ctx.space.hostId) {
        return modelSpace
      }

      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          mode: {
            t: 'edit',
          },
        },
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      if (!modelSpace.screenPuzzleBuilder) {
        return modelSpace
      }
      const initial = PlayMode.init({
        ctx: PlayMode.initCtx({
          flow: EditMode.toFlowMemoized({
            model: modelSpace.screenPuzzleBuilder.editMode,
          }),
          solutions: ctx.solutions,
        }),
      })
      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          mode: {
            t: 'play',
          },
          playMode: initial,
        },
      }
    }

    case 'screen-puzzle-builder.user-clicked-exit-button': {
      if (msgSpace.userId !== ctx.space.hostId) {
        return modelSpace
      }

      return {
        ...modelSpace,
        screen: {
          t: 'screen-puzzle-builder-open',
        },
      }
    }

    default: {
      return modelSpace
    }
  }
}

const updates: (typeof updateSpaceMain)[] = [
  updateSpaceMain,
  DeleteForeverSpace.updateSpace,
  EditPuzzleNameSpace.updateSpace,
  SaveChangesSpace.updateSpace,
]

const updateSpace: typeof updateSpaceMain = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelSpace: acc }), input.modelSpace)
}

export const ScreenPuzzleBuilderSpace = {
  updateSpace,
  toFlow,
  toStatus,
}
