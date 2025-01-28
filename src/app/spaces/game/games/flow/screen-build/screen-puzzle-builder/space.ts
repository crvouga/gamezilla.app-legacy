import { ModeEdit } from '../../@/mode-edit'
import { ModePlay } from '../../@/mode-play'
import { FlowSpaceCtx } from '../../@/space/ctx'
import { Variant } from '../../@/variant'
import * as BuilderTypes from '../types'
import { DeleteForeverSpace } from './surface-delete-forever/space'
import { EditPuzzleNameSpace } from './surface-edit-puzzle-name/space'
import { SaveChangesSpace } from './drawer-save-changes/space'
import { ModelSpace } from './types'

const toStatus = (modelSpace: ModelSpace): 'solving' | 'solved' => {
  return ModePlay.toStatus({ model: modelSpace.ModePlay, flow: toFlow(modelSpace) })
}

const toFlow = (modelSpace: ModelSpace): Variant.Model => {
  switch (modelSpace.mode.t) {
    case 'edit': {
      return ModeEdit.toFlow({ model: modelSpace.ModeEdit })
    }

    case 'play': {
      return ModePlay.toFlow({ flow: ModeEdit.toFlow({ model: modelSpace.ModeEdit }), model: modelSpace.ModePlay })
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

      const flow = ModeEdit.toFlowMemoized({
        model: modelSpace.screenPuzzleBuilder.ModeEdit,
      })

      const updated = ModePlay.update({
        model: modelSpace.screenPuzzleBuilder.ModePlay,
        msg: msgSpace.c,
        ctx: ModePlay.initCtx({ flow }),
      })

      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          ModePlay: updated.model,
        },
      }
    }

    case 'screen-puzzle-builder.got-edit-msg': {
      if (!modelSpace.screenPuzzleBuilder) {
        return modelSpace
      }

      const updated = ModeEdit.update({
        model: modelSpace.screenPuzzleBuilder.ModeEdit,
        msg: msgSpace.c,
        flow: modelSpace.screenPuzzleBuilder.puzzle.flow,
      })

      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          ModeEdit: updated.model,
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
      const initial = ModePlay.init({
        ctx: ModePlay.initCtx({ flow: ModeEdit.toFlowMemoized({ model: modelSpace.screenPuzzleBuilder.ModeEdit }) }),
      })
      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          mode: {
            t: 'play',
          },
          ModePlay: initial,
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

export const ScreenPuzzleBuildSpace = {
  updateSpace,
  toFlow,
  toStatus,
}
