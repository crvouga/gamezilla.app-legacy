import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    default: {
      return modelSync
    }
  }
}

export const PackCreateGame = {
  reducer,
}
