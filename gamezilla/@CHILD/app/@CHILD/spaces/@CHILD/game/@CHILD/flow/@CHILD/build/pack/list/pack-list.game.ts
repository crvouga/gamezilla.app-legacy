import { SyncReducer } from "../../build.core"

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-list.user-clicked-pack-item": {
      return {
        ...modelSync,
        opened: {
          t: "pack-builder",
        },
        packBuilder: {
          t: "pack-builder",
          pack: msgSync.pack,
          opened: {
            t: null,
          },
          screen: {
            t: "screen-puzzle-grid",
            pageIndex: 0,
          },
        },
      }
    }

    default: {
      return modelSync
    }
  }
}

export const PackListGame = {
  reducer,
}
