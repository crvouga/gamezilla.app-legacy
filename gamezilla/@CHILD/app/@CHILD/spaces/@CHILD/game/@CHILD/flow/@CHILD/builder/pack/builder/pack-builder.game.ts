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
        ...modelGame,
        opened: { t: "pack-builder" },
        packBuilder: {
          t: "pack-builder",
          opened: {
            t: "puzzle-grid",
            pageIndex: 0,
          },
          pack: msgGame.created.value,
        },
      }
    }

    case "pack-builder.user-clicked-exit-button": {
      return {
        puzzleBuilder: modelGame.puzzleBuilder,
        packBuilder: modelGame.packBuilder,
        opened: { t: "list" },
        listTab: "packs",
      }
    }

    case "pack-builder.user-clicked-puzzle-picker-item": {
      if (!modelGame.packBuilder) {
        return modelGame
      }
      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          pack: FlowPack.add(modelGame.packBuilder.pack, msgGame.puzzle.id),
          opened: { t: "puzzle-grid", pageIndex: 0 },
        },
      }
    }

    case "pack-builder.user-clicked-open-puzzle-picker-button": {
      if (!modelGame.packBuilder) {
        return modelGame
      }
      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          opened: {
            t: "puzzle-picker",
          },
        },
      }
    }

    case "pack-builder.user-closed-puzzle-picker": {
      if (!modelGame.packBuilder) {
        return modelGame
      }
      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          opened: {
            t: "puzzle-grid",
            pageIndex: 0,
          },
        },
      }
    }

    case "pack-builder.user-clicked-puzzle-grid-item": {
      if (!modelGame.packBuilder) {
        return modelGame
      }
      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          opened: {
            t: "puzzle",
            index: msgGame.index,
          },
        },
      }
    }

    case "pack-builder.user-clicked-exit-puzzle-button": {
      if (!modelGame.packBuilder) {
        return modelGame
      }

      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          opened: {
            t: "puzzle-grid",
            pageIndex: 0,
          },
        },
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
