import { isErr } from "gamezilla/@SHARED/core"
import { GameReducer } from "../../builder.core"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"

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

    case "pack-builder.user-clicked-exit-button": {
      return {
        t: "list",
        listTab: "packs",
      }
    }

    case "pack-builder.user-clicked-puzzle-picker-item": {
      switch (modelGame.t) {
        case "pack-builder": {
          return {
            ...modelGame,
            pack: FlowPack.add(modelGame.pack, msgGame.puzzle.id),
          }
        }

        default: {
          return modelGame
        }
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
