import { FlowCoreCtx } from '../../@/core/ctx'
import { Edit } from '../../@/edit'
import { Play } from '../../@/play'
import { Variant } from '../../@/variant'
import * as BuilderTypes from '../types'
import { DeleteForeverCore } from './delete-forever/core'
import { EditPuzzleNameCore } from './edit-puzzle-name/core'
import { SaveChangesCore } from './save-changes/core'
import { ModelCore } from './types'

const toStatus = (modelCore: ModelCore): 'solving' | 'solved' => {
  return Play.toStatus({ model: modelCore.playMode, flow: toFlow(modelCore) })
}

const toFlow = (modelCore: ModelCore): Variant.Model => {
  switch (modelCore.mode.t) {
    case 'edit': {
      return Edit.toFlow({ model: modelCore.editMode })
    }

    case 'play': {
      return Play.toFlow({ flow: Edit.toFlow({ model: modelCore.editMode }), model: modelCore.playMode })
    }
  }
}

const updateCoreMain = ({
  modelCore,
  msgCore,
  ctx,
}: {
  ctx: FlowCoreCtx
  msgCore: BuilderTypes.MsgCore
  modelCore: BuilderTypes.ModelCore
}): BuilderTypes.ModelCore => {
  switch (msgCore.t) {
    case 'screen-puzzle-builder.got-play-msg': {
      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }

      const flow = Edit.toFlowMemoized({
        model: modelCore.screenPuzzleBuilder.editMode,
      })

      const updated = Play.update({
        model: modelCore.screenPuzzleBuilder.playMode,
        msg: msgCore.c,
        ctx: Play.initCtx({ flow, solutions: ctx.solutions }),
      })

      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
          playMode: updated.model,
        },
      }
    }

    case 'screen-puzzle-builder.got-edit-msg': {
      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }

      const updated = Edit.update({
        model: modelCore.screenPuzzleBuilder.editMode,
        msg: msgCore.c,
        flow: modelCore.screenPuzzleBuilder.puzzle.flow,
      })

      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
          editMode: updated.model,
        },
      }
    }

    case 'screen-puzzle-builder.user-clicked-edit-mode-button': {
      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }

      if (msgCore.userId !== ctx.space.hostId) {
        return modelCore
      }

      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
          mode: {
            t: 'edit',
          },
        },
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }
      const initial = Play.init({
        ctx: Play.initCtx({
          flow: Edit.toFlowMemoized({
            model: modelCore.screenPuzzleBuilder.editMode,
          }),
          solutions: ctx.solutions,
        }),
      })
      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
          mode: {
            t: 'play',
          },
          playMode: initial,
        },
      }
    }

    case 'screen-puzzle-builder.user-clicked-exit-button': {
      if (msgCore.userId !== ctx.space.hostId) {
        return modelCore
      }

      return {
        ...modelCore,
        screen: {
          t: 'screen-puzzle-builder-open',
        },
      }
    }

    default: {
      return modelCore
    }
  }
}

const updates: (typeof updateCoreMain)[] = [
  updateCoreMain,
  DeleteForeverCore.updateCore,
  EditPuzzleNameCore.updateCore,
  SaveChangesCore.updateCore,
]

const updateCore: typeof updateCoreMain = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelCore: acc }), input.modelCore)
}

export const ScreenPuzzleBuilderCore = {
  updateCore,
  toFlow,
  toStatus,
}
