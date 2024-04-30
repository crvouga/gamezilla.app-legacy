import { SpaceCtx } from "gamezilla-app/app/spaces/@SHARED/space"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleName } from "../../../../@SHARED/flow-puzzle/flow-puzzle-name"
import { ModelSync, MsgSync } from "../../create.core"

const reducer = ({
  modelSync,
  msgSync,
}: {
  ctx: SpaceCtx
  msgSync: MsgSync
  modelSync: ModelSync
}): ModelSync => {
  switch (msgSync.t) {
    case "user-edited-puzzle-name": {
      const puzzleBuilder = modelSync.puzzleBuilder
      if (!puzzleBuilder) {
        return modelSync
      }

      if (msgSync.flowPuzzleId !== puzzleBuilder.puzzle.id) {
        return modelSync
      }
      if (msgSync.edited.t === "err") {
        return modelSync
      }
      if (!FlowPuzzleName.is(msgSync.newName)) {
        return modelSync
      }
      const puzzleNew: FlowPuzzle = {
        ...puzzleBuilder.puzzle,
        name: msgSync.newName,
      }
      return {
        ...modelSync,
        puzzleBuilder: {
          ...puzzleBuilder,
          puzzle: puzzleNew,
        },
      }
    }

    default: {
      return modelSync
    }
  }
}

export const PuzzleEditGame = {
  reducer,
}
