import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleName } from "../../../../@SHARED/flow-puzzle/flow-puzzle-name"
import { ModelGame, MsgGame } from "../../builder.core"

const reducer = ({
  modelGame,
  msgGame,
}: {
  ctx: SpaceCtx
  msgGame: MsgGame
  modelGame: ModelGame
}): ModelGame => {
  switch (msgGame.t) {
    case "user-edited-puzzle-name": {
      const puzzleBuilder = modelGame.puzzleBuilder
      if (!puzzleBuilder) {
        return modelGame
      }

      if (msgGame.flowPuzzleId !== puzzleBuilder.puzzle.id) {
        return modelGame
      }
      if (msgGame.edited.t === "err") {
        return modelGame
      }
      if (!FlowPuzzleName.is(msgGame.newName)) {
        return modelGame
      }
      const puzzleNew: FlowPuzzle = {
        ...puzzleBuilder.puzzle,
        name: msgGame.newName,
      }
      return {
        ...modelGame,
        puzzleBuilder: {
          ...puzzleBuilder,
          puzzle: puzzleNew,
        },
      }
    }

    default: {
      return modelGame
    }
  }
}

export const PuzzleEditGame = {
  reducer,
}
