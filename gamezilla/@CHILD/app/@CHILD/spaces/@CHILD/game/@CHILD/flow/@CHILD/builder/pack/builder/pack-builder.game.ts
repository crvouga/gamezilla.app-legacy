import { isErr } from "gamezilla/@SHARED/core"
import { GameReducer } from "../../builder.core"

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "user-created-pack": {
      if (isErr(msgGame.created)) {
        return modelGame
      }
      return {
        t: "pack-builder",
        listTab: "packs",
        pack: msgGame.created.value,
      }
    }

    case "user-exited-pack-builder": {
      return {
        t: "list",
        listTab: "packs",
      }
    }

    default: {
      return modelGame
    }
  }
}

export const PackBuilderGame = {
  reducer,
}
