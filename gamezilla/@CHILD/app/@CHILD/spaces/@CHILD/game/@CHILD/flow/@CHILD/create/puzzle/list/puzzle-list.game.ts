import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"
import { SyncReducer } from "../../create.core"

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "puzzle-list.clicked-puzzle-list-item": {
      return {
        listTab: "puzzles",
        packBuilder: modelSync.packBuilder,
        opened: { t: "puzzle-builder" },
        puzzleBuilder: {
          t: "puzzle-builder",
          gridEdit: FlowGridUIEdit.init({
            grid: msgSync.puzzle.puzzle.c,
          }),
          gridPlay: FlowGridUIPlay.init({
            grid: msgSync.puzzle.puzzle.c,
          }),
          mode: { t: "edit" },
          puzzle: msgSync.puzzle,
        },
      }
    }

    default: {
      return modelSync
    }
  }
}

export const PuzzeListGame = { reducer }
