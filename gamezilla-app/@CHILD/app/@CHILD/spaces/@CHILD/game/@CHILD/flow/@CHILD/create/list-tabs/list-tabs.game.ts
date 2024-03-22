import { SyncReducer } from "../create.core"
import { ModelSync } from "./list-tabs.core"

const initSync: ModelSync = {
  listTab: "puzzles",
}

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "user-changed-list-tab": {
      return {
        ...modelSync,
        listTab: msgSync.listTab,
      }
    }

    default: {
      return modelSync
    }
  }
}

export const ListTabsGame = {
  initSync,
  reducer,
}
