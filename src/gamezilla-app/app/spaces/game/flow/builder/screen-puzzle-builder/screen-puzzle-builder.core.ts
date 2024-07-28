import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import type { ModelCore, MsgCore } from '../builder.types'
import { DeleteForeverCore } from './delete-forever/delete-forever.core'
import { EditPuzzleNameCore } from './edit-puzzle-name/edit-puzzle-name.core'
import { SaveChangesCore } from './save-changes/save-changes.core'
import { FlowEdit } from '../../@/flow/flow-edit'
import { FlowPlay } from '../../@/flow/flow-play'

const updateCoreMain = ({
  modelCore,
  msgCore,
  ctx
}: {
  ctx: SpaceCtx
  msgCore: MsgCore
  modelCore: ModelCore
}): ModelCore => {
  switch (msgCore.t) {
    case 'screen-puzzle-builder.flow-ui-play': {
      if (!modelCore.puzzleBuilder) {
        return modelCore
      }

      const flow = FlowEdit.toFlowMemoized({
        model: modelCore.puzzleBuilder.edit
      })

      const updated = FlowPlay.update({
        model: modelCore.puzzleBuilder.play,
        msg: msgCore.c,
        ctx: {
          flowPuzzle: {
            ...modelCore.puzzleBuilder.puzzle,
            flow: flow
          }
        }
      })

      return {
        ...modelCore,
        puzzleBuilder: {
          ...modelCore.puzzleBuilder,
          play: updated.model
        }
      }
    }

    case 'screen-puzzle-builder.flow-ui-edit': {
      if (!modelCore.puzzleBuilder) {
        return modelCore
      }

      const updated = FlowEdit.update({
        model: modelCore.puzzleBuilder.edit,
        msg: msgCore.c,
        flow: modelCore.puzzleBuilder.puzzle.flow
      })

      return {
        ...modelCore,
        puzzleBuilder: {
          ...modelCore.puzzleBuilder,
          edit: updated.model
        }
      }
    }

    case 'screen-puzzle-builder.user-clicked-edit-mode-button': {
      if (!modelCore.puzzleBuilder) {
        return modelCore
      }

      if (msgCore.userId !== ctx.space.hostId) {
        return modelCore
      }

      return {
        ...modelCore,
        puzzleBuilder: {
          ...modelCore.puzzleBuilder,
          mode: {
            t: 'edit'
          }
        }
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      if (!modelCore.puzzleBuilder) {
        return modelCore
      }
      const initial = FlowPlay.init({
        ctx: {
          flowPuzzle: {
            ...modelCore.puzzleBuilder.puzzle,
            flow: FlowEdit.toFlowMemoized({
              model: modelCore.puzzleBuilder.edit
            })
          }
        }
      })
      return {
        ...modelCore,
        puzzleBuilder: {
          ...modelCore.puzzleBuilder,
          mode: {
            t: 'play'
          },
          play: initial
        }
      }
    }

    case 'screen-puzzle-builder.user-clicked-exit-button': {
      if (msgCore.userId !== ctx.space.hostId) {
        return modelCore
      }

      return {
        ...modelCore,
        opened: {
          t: 'list'
        },
        listTab: 'puzzles'
      }
    }

    default: {
      return modelCore
    }
  }
}

const updateCore: typeof updateCoreMain = (input) => {
  return [
    updateCoreMain,
    DeleteForeverCore.updateCore,
    EditPuzzleNameCore.updateCore,
    SaveChangesCore.updateCore
  ].reduce(
    (acc, updateCore) =>
      updateCore({
        ...input,
        modelCore: acc
      }),
    input.modelCore
  )
}

export const ScreenPuzzleBuilderCore = {
  updateCore
}
