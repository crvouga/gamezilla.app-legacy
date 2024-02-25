import { SyncReducer } from "../../create.core"

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "user-deleted-puzzle": {
      return {
        ...modelSync,
        puzzleBuilder: null,
        opened: { t: "list" },
        listTab: "puzzles",
      }
    }
    default: {
      return modelSync
    }
  }
}

export const PuzzleDeleteForeverGame = {
  reducer,
}
