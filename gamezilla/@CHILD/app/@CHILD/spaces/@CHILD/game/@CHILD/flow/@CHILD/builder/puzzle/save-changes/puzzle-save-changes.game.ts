import { isErr } from "gamezilla/@SHARED/core"
import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelGame, msgSync }) => {
  switch (msgSync.t) {
    case "user-saved-changes": {
      if (isErr(msgSync.saved)) {
        return modelGame
      }
      return { ...modelGame, puzzle: msgSync.saved.value }
    }

    default: {
      return modelGame
    }
  }
}

export const PuzzleSaveChangesGame = {
  reducer,
}
