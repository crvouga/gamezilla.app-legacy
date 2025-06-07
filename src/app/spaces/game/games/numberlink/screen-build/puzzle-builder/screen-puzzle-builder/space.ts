import { ModeEdit } from '../../../@/mode-edit'
import { ModePlay } from '../../../@/mode-play'
import { NumberlinkSpaceCtx } from '../../../@/space/ctx'
import { NumberlinkVariant } from '../../../@/variant'
import * as BuilderTypes from '../../types'
import { DeleteForeverSpace } from './surface-delete-forever/space'
import { EditPuzzleNameSpace } from './surface-edit-puzzle-name/space'
import { SaveChangesSpace } from './surface-save-changes/space'
import { ModelSpace } from './types'

const toStatus = (modelSpace: ModelSpace): 'solving' | 'solved' => {
  return ModePlay.toStatus({ model: modelSpace.modePlay, numberlink: toNumberlink(modelSpace) })
}

const toNumberlink = (modelSpace: ModelSpace): NumberlinkVariant.Model => {
  switch (modelSpace.mode.t) {
    case 'edit': {
      return ModeEdit.toNumberlink(modelSpace.modeEdit)
    }

    case 'play': {
      return ModePlay.toNumberlink(modelSpace.modePlay, ModeEdit.toNumberlink(modelSpace.modeEdit))
    }
  }
}

const updateSpaceMain = ({
  modelSpace,
  msgSpace,
  ctx,
}: {
  ctx: NumberlinkSpaceCtx
  msgSpace: BuilderTypes.MsgSpace
  modelSpace: BuilderTypes.ModelSpace
}): BuilderTypes.ModelSpace => {
  switch (msgSpace.t) {
    case 'screen-puzzle-builder.got-play-msg': {
      if (!modelSpace.screenPuzzleBuilder) {
        return modelSpace
      }

      const numberlink = ModeEdit.toNumberlink(modelSpace.screenPuzzleBuilder.modeEdit)

      const updated = ModePlay.update({
        model: modelSpace.screenPuzzleBuilder.modePlay,
        msg: msgSpace.c,
        ctx: ModePlay.initCtx({ numberlink: numberlink }),
      })

      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          modePlay: updated.model,
        },
      }
    }

    case 'screen-puzzle-builder.got-edit-msg': {
      if (!modelSpace.screenPuzzleBuilder) {
        return modelSpace
      }

      const updated = ModeEdit.update({
        model: modelSpace.screenPuzzleBuilder.modeEdit,
        msg: msgSpace.c,
        numberlink: modelSpace.screenPuzzleBuilder.puzzle.numberlink,
      })

      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          modeEdit: updated.model,
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
        ctx: ModePlay.initCtx({ numberlink: ModeEdit.toNumberlink(modelSpace.screenPuzzleBuilder.modeEdit) }),
      })
      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...modelSpace.screenPuzzleBuilder,
          mode: {
            t: 'play',
          },
          modePlay: initial,
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
  toNumberlink,
  toStatus,
}
