import { GameReducer } from "../../builder.core"

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "pack-list.user-clicked-pack-item": {
      return {
        ...modelGame,
        t: "pack-builder",
        pack: msgGame.pack,
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
