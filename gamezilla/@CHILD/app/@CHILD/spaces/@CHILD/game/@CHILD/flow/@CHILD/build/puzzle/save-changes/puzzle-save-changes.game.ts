import { isErr } from "gamezilla/@SHARED/core"
import { SyncReducer } from "../../build.core"

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "puzzle-builder.saved-puzzle": {
      if (isErr(msgSync.saved)) {
        return modelSync
      }

      if (!modelSync.puzzleBuilder) {
        return modelSync
      }

      return {
        listTab: modelSync.listTab,
        opened: modelSync.opened,
        packBuilder: modelSync.packBuilder,
        puzzleBuilder: {
          ...modelSync.puzzleBuilder,
          puzzle: msgSync.saved.value,
        },
      }
    }

    default: {
      return modelSync
    }
  }
}

export const PuzzleSaveChangesGame = {
  reducer,
}
