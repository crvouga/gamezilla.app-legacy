import { isErr } from "gamezilla/@SHARED/core"
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"
import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelGame, msgSync }) => {
  switch (msgSync.t) {
    case "user-created-puzzle": {
      if (isErr(msgSync.created)) {
        return modelGame
      }
      const puzzleNew = msgSync.created.value
      return {
        listTab: modelGame.listTab,
        opened: { t: "puzzle-builder" },
        packBuilder: modelGame.packBuilder,
        puzzleBuilder: {
          t: "puzzle-builder",
          mode: { t: "edit" },
          gridEdit: FlowGridUIEdit.init({ grid: puzzleNew.puzzle.c }),
          gridPlay: FlowGridUIPlay.init({ grid: puzzleNew.puzzle.c }),
          puzzle: puzzleNew,
        },
      }
    }

    default: {
      return modelGame
    }
  }
}

export const PuzzleCreateGame = { reducer }
