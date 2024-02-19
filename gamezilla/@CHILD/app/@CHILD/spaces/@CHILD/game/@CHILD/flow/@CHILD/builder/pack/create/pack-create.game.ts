import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelGame, msgSync }) => {
  switch (msgSync.t) {
    default: {
      return modelGame
    }
  }
}

export const PackCreateGame = {
  reducer,
}
