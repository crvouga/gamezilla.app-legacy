import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"
import { ModelSync, MsgSync } from "../../builder.core"

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
    case "puzzle-builder.grid-ui-play": {
      if (!modelSync.puzzleBuilder) {
        return modelSync
      }

      const currentGrid = FlowGridUIEdit.toCurrentGrid({
        model: modelSync.puzzleBuilder.gridEdit,
      })

      const updated = FlowGridUIPlay.update({
        model: modelSync.puzzleBuilder.gridPlay,
        msg: msgSync.c,
        grid: currentGrid,
      })

      return {
        ...modelSync,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          gridPlay: updated,
        },
      }
    }

    case "puzzle-builder.grid-ui-edit": {
      if (!modelSync.puzzleBuilder) {
        return modelSync
      }

      const updated = FlowGridUIEdit.update({
        model: modelSync.puzzleBuilder.gridEdit,
        msg: msgSync.c,
        grid: modelSync.puzzleBuilder.puzzle.puzzle.c,
      })

      return {
        ...modelSync,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          gridEdit: updated.model,
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
      const initial = FlowGridUIPlay.init({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: modelSync.puzzleBuilder.gridEdit,
        }),
      })
      return {
        ...modelSync,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          mode: { t: "play" },
          gridPlay: initial,
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
