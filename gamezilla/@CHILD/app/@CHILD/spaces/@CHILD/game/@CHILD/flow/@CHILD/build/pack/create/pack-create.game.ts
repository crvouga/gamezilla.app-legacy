import { SyncReducer } from "../../build.core"

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
