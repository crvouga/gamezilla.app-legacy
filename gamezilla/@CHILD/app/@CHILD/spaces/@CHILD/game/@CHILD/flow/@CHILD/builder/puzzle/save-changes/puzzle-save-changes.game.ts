import { isErr } from "gamezilla/@SHARED/core"
import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "user-saved-changes": {
      if (isErr(msgSync.saved)) {
        return modelSync
      }
      return { ...modelSync, puzzle: msgSync.saved.value }
    }

    default: {
      return modelSync
    }
  }
}

export const PuzzleSaveChangesGame = {
  reducer,
}
