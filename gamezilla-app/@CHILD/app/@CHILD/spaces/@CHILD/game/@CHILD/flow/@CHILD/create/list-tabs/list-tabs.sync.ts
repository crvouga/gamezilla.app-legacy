import { SyncReducer } from "../create.core"
import { ModelSync } from "./list-tabs.core"

const initSync: ModelSync = {
  listTab: "puzzles",
}

const reducer: SyncReducer = (input) => {
  switch (input.msgSync.t) {
    case "user-changed-list-tab": {
      return {
        ...input.modelSync,
        listTab: input.msgSync.listTab,
      }
    }

    default: {
      return input.modelSync
    }
  }
}

export const ListTabsGame = {
  initSync,
  reducer,
}
