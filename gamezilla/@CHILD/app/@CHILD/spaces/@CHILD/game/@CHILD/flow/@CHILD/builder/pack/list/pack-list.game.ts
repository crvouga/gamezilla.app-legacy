import { SyncReducer } from "../../builder.core"

const reducer: SyncReducer = ({ modelGame, msgSync }) => {
  switch (msgSync.t) {
    case "pack-list.user-clicked-pack-item": {
      return {
        ...modelGame,
        opened: { t: "pack-builder" },
        packBuilder: {
          t: "pack-builder",
          pack: msgSync.pack,
          opened: { t: "pack", pageIndex: 0 },
        },
      }
    }

    default: {
      return modelGame
    }
  }
}

export const PackListGame = {
  reducer,
}
