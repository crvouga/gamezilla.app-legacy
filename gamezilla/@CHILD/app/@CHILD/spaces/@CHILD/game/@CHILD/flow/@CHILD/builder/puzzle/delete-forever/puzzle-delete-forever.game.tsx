import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelGame, msgSync }) => {
  switch (msgSync.t) {
    case "user-deleted-puzzle": {
      return {
        ...modelGame,
        puzzleBuilder: null,
        opened: { t: "list" },
        listTab: "puzzles",
      }
    }
    default: {
      return modelGame
    }
  }
}

export const PuzzleDeleteForeverGame = {
  reducer,
}
