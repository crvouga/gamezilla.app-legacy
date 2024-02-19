import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"
import { ModelSync, MsgSync } from "../../builder.core"

const reducer = ({
  modelGame,
  msgSync,
  ctx,
}: {
  ctx: SpaceCtx
  msgSync: MsgSync
  modelGame: ModelSync
}): ModelSync => {
  switch (msgSync.t) {
    case "puzzle-builder.grid-ui-play": {
      if (!modelGame.puzzleBuilder) {
        return modelGame
      }

      const currentGrid = FlowGridUIEdit.toCurrentGrid({
        model: modelGame.puzzleBuilder.gridEdit,
      })

      const updated = FlowGridUIPlay.update({
        model: modelGame.puzzleBuilder.gridPlay,
        msg: msgSync.c,
        grid: currentGrid,
      })

      return {
        ...modelGame,
        puzzleBuilder: {
          ...modelGame.puzzleBuilder,
          gridPlay: updated,
        },
      }
    }

    case "puzzle-builder.grid-ui-edit": {
      if (!modelGame.puzzleBuilder) {
        return modelGame
      }

      const updated = FlowGridUIEdit.update({
        model: modelGame.puzzleBuilder.gridEdit,
        msg: msgSync.c,
        grid: modelGame.puzzleBuilder.puzzle.puzzle.c,
      })

      return {
        ...modelGame,
        puzzleBuilder: {
          ...modelGame.puzzleBuilder,
          gridEdit: updated.model,
        },
      }
    }

    case "puzzle-builder.user-clicked-edit-mode-button": {
      if (!modelGame.puzzleBuilder) {
        return modelGame
      }

      if (msgSync.userId !== ctx.space.hostId) {
        return modelGame
      }

      return {
        ...modelGame,
        puzzleBuilder: {
          ...modelGame.puzzleBuilder,
          mode: { t: "edit" },
        },
      }
    }

    case "puzzle-builder.user-clicked-play-mode-button": {
      if (!modelGame.puzzleBuilder) {
        return modelGame
      }
      const initial = FlowGridUIPlay.init({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: modelGame.puzzleBuilder.gridEdit,
        }),
      })
      return {
        ...modelGame,
        puzzleBuilder: {
          ...modelGame.puzzleBuilder,
          mode: { t: "play" },
          gridPlay: initial,
        },
      }
    }

    case "puzzle-builder.user-clicked-exit-button": {
      if (msgSync.userId !== ctx.space.hostId) {
        return modelGame
      }

      return { ...modelGame, opened: { t: "list" }, listTab: "puzzles" }
    }

    default: {
      return modelGame
    }
  }
}

export const PuzzleBuilderGame = {
  reducer,
}
