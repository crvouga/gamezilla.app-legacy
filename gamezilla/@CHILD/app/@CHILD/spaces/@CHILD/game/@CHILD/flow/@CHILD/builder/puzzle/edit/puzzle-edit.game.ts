import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleName } from "../../../../@SHARED/flow-puzzle/flow-puzzle-name"
import { ModelSync, MsgSync } from "../../builder.core"

const reducer = ({
  modelGame,
  msgSync,
}: {
  ctx: SpaceCtx
  msgSync: MsgSync
  modelGame: ModelSync
}): ModelSync => {
  switch (msgSync.t) {
    case "user-edited-puzzle-name": {
      const puzzleBuilder = modelGame.puzzleBuilder
      if (!puzzleBuilder) {
        return modelGame
      }

      if (msgSync.flowPuzzleId !== puzzleBuilder.puzzle.id) {
        return modelGame
      }
      if (msgSync.edited.t === "err") {
        return modelGame
      }
      if (!FlowPuzzleName.is(msgSync.newName)) {
        return modelGame
      }
      const puzzleNew: FlowPuzzle = {
        ...puzzleBuilder.puzzle,
        name: msgSync.newName,
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
