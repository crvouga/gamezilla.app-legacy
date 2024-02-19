import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"
import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelGame, msgSync }) => {
  switch (msgSync.t) {
    case "puzzle-list.clicked-puzzle-list-item": {
      return {
        listTab: "puzzles",
        packBuilder: modelGame.packBuilder,
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
      return modelGame
    }
  }
}

export const PuzzeListGame = { reducer }
