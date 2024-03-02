import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { FlowVariantUIEdit, FlowVariantUIPlay } from "../../../../@SHARED/flow"
import { ModelSync, MsgSync } from "../../create.core"

const reducer = ({
  modelSync,
  msgSync,
  ctx,
}: {
  ctx: SpaceCtx
  msgSync: MsgSync
  modelSync: ModelSync
}): ModelSync => {
  switch (msgSync.t) {
    case "puzzle-builder.flow-ui-play": {
      if (!modelSync.puzzleBuilder) {
        return modelSync
      }

      const currentFlow = FlowVariantUIEdit.toCurrentFlow({
        model: modelSync.puzzleBuilder.edit,
      })

      const updated = FlowVariantUIPlay.update({
        model: modelSync.puzzleBuilder.play,
        msg: msgSync.c,
        flow: currentFlow,
      })

      return {
        ...modelSync,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          play: updated,
        },
      }
    }

    case "puzzle-builder.flow-ui-edit": {
      if (!modelSync.puzzleBuilder) {
        return modelSync
      }

      const updated = FlowVariantUIEdit.update({
        model: modelSync.puzzleBuilder.edit,
        msg: msgSync.c,
        flow: modelSync.puzzleBuilder.puzzle.flow,
      })

      return {
        ...modelSync,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          edit: updated.model,
        },
      }
    }

    case "puzzle-builder.user-clicked-edit-mode-button": {
      if (!modelSync.puzzleBuilder) {
        return modelSync
      }

      if (msgSync.userId !== ctx.space.hostId) {
        return modelSync
      }

      return {
        ...modelSync,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          mode: { t: "edit" },
        },
      }
    }

    case "puzzle-builder.user-clicked-play-mode-button": {
      if (!modelSync.puzzleBuilder) {
        return modelSync
      }
      const initial = FlowVariantUIPlay.init({
        flow: FlowVariantUIEdit.toCurrentFlow({
          model: modelSync.puzzleBuilder.edit,
        }),
      })
      return {
        ...modelSync,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          mode: { t: "play" },
          play: initial,
        },
      }
    }

    case "puzzle-builder.user-clicked-exit-button": {
      if (msgSync.userId !== ctx.space.hostId) {
        return modelSync
      }

      return { ...modelSync, opened: { t: "list" }, listTab: "puzzles" }
    }

    default: {
      return modelSync
    }
  }
}

export const PuzzleBuilderGame = {
  reducer,
}
