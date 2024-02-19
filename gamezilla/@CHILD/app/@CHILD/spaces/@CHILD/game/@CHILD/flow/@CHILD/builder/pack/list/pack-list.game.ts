import { GameReducer } from "../../builder.core"

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "pack-list.user-clicked-pack-item": {
      return {
        ...modelGame,
        opened: { t: "pack-builder" },
        packBuilder: {
          t: "pack-builder",
          pack: msgGame.pack,
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
