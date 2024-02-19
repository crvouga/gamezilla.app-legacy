import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"
import { GameReducer } from "../../builder.core"

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "puzzle-list.clicked-puzzle-list-item": {
      return {
        listTab: "puzzles",
        packBuilder: modelGame.packBuilder,
        opened: { t: "puzzle-builder" },
        puzzleBuilder: {
          t: "puzzle-builder",
          gridEdit: FlowGridUIEdit.init({
            grid: msgGame.puzzle.puzzle.c,
          }),
          gridPlay: FlowGridUIPlay.init({
            grid: msgGame.puzzle.puzzle.c,
          }),
          mode: { t: "edit" },
          puzzle: msgGame.puzzle,
        },
      }
    }

    default: {
      return modelGame
    }
  }
}

export const PuzzeListGame = { reducer }
