import { isErr } from "gamezilla/@SHARED/core"
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"
import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "user-created-puzzle": {
      if (isErr(msgSync.created)) {
        return modelSync
      }
      const puzzleNew = msgSync.created.value
      return {
        listTab: modelSync.listTab,
        opened: { t: "puzzle-builder" },
        packBuilder: modelSync.packBuilder,
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
      return modelSync
    }
  }
}

export const PuzzleCreateGame = { reducer }
