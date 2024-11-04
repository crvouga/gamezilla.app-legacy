import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space-ctx'
import { FlowVariant } from '../../@/flow'
import { FlowEdit } from '../../@/flow/flow-edit'
import { FlowPlay } from '../../@/flow/flow-play'
import * as BuilderTypes from '../types'
import { DeleteForeverCore } from './delete-forever/core'
import { EditPuzzleNameCore } from './edit-puzzle-name/core'
import { SaveChangesCore } from './save-changes/core'
import { ModelCore } from './types'

export const toStatus = (modelCore: ModelCore): 'solving' | 'solved' => {
  return FlowPlay.toStatus({
    model: modelCore.play,
    flow: toFlow(modelCore)
  })
}

export const toFlow = (modelCore: ModelCore): FlowVariant.Model => {
  switch (modelCore.mode.t) {
    case 'edit': {
      return FlowEdit.toFlow({
        model: modelCore.edit
      })
    }

    case 'play': {
      return FlowPlay.toFlow({
        flow: FlowEdit.toFlow({
          model: modelCore.edit
        }),
        model: modelCore.play
      })
    }
  }
}

const updateCoreMain = ({
  modelCore,
  msgCore,
  ctx
}: {
  ctx: SpaceCtx
  msgCore: BuilderTypes.MsgCore
  modelCore: BuilderTypes.ModelCore
}): BuilderTypes.ModelCore => {
  switch (msgCore.t) {
    case 'screen-puzzle-builder.got-flow-ui-play-msg': {
      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }

      const flow = FlowEdit.toFlowMemoized({
        model: modelCore.screenPuzzleBuilder.edit
      })

      const updated = FlowPlay.update({
        model: modelCore.screenPuzzleBuilder.play,
        msg: msgCore.c,
        ctx: FlowPlay.initCtx({
          flowPuzzle: {
            ...modelCore.screenPuzzleBuilder.puzzle,
            flow: flow
          }
        })
      })

      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
          play: updated.model
        }
      }
    }

    case 'screen-puzzle-builder.got-flow-ui-edit-msg': {
      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }

      const updated = FlowEdit.update({
        model: modelCore.screenPuzzleBuilder.edit,
        msg: msgCore.c,
        flow: modelCore.screenPuzzleBuilder.puzzle.flow
      })

      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
          edit: updated.model
        }
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
            t: 'edit'
          }
        }
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }
      const initial = FlowPlay.init({
        ctx: FlowPlay.initCtx({
          flowPuzzle: {
            ...modelCore.screenPuzzleBuilder.puzzle,
            flow: FlowEdit.toFlowMemoized({
              model: modelCore.screenPuzzleBuilder.edit
            })
          }
        })
      })
      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
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
        screen: {
          t: 'screen-puzzle-builder-open'
        }
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
  SaveChangesCore.updateCore
]

const updateCore: typeof updateCoreMain = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelCore: acc }), input.modelCore)
}

export const ScreenPuzzleBuilderCore = {
  updateCore
}
