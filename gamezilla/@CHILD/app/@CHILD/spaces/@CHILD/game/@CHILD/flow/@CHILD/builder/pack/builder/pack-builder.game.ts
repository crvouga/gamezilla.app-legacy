import { isErr } from "gamezilla/@SHARED/core"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { GameReducer } from "../../builder.core"
import { FlowGridUIPlay } from "../../../../@SHARED/flow"

const userCreatedPack: GameReducer = ({ modelGame, msgGame }) => {
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
            t: "pack",
            pageIndex: 0,
          },
          pack: msgGame.created.value,
        },
      }
    }
    default: {
      return modelGame
    }
  }
}

const mainReducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "pack-builder.user-clicked-exit-button": {
      return {
        puzzleBuilder: modelGame.puzzleBuilder,
        packBuilder: modelGame.packBuilder,
        opened: { t: "list" },
        listTab: "packs",
      }
    }

    case "pack-builder.user-clicked-add-puzzle-item": {
      if (!modelGame.packBuilder) {
        return modelGame
      }
      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          pack: FlowPack.add(modelGame.packBuilder.pack, msgGame.puzzle.id),
          opened: {
            t: "pack",
            pageIndex: 0,
          },
        },
      }
    }

    case "pack-builder.user-clicked-open-add-puzzle-button": {
      if (!modelGame.packBuilder) {
        return modelGame
      }
      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          opened: {
            t: "add-puzzle",
          },
        },
      }
    }

    case "pack-builder.user-closed-add-puzzle": {
      if (!modelGame.packBuilder) {
        return modelGame
      }
      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          opened: {
            t: "pack",
            pageIndex: 0,
          },
        },
      }
    }

    case "pack-builder.user-clicked-pack-item": {
      if (!modelGame.packBuilder) {
        return modelGame
      }

      return {
        ...modelGame,
        packBuilder: {
          ...modelGame.packBuilder,
          opened: {
            t: "puzzle",
            puzzleIndex: msgGame.index,
            puzzle: {
              t: "grid",
              flowGrid: msgGame.puzzle.puzzle.c,
              flowGridUIPlay: FlowGridUIPlay.init({
                grid: msgGame.puzzle.puzzle.c,
              }),
            },
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
            t: "pack",
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

const reducer: GameReducer = (input) => {
  return [
    userCreatedPack,
    mainReducer,
    //
  ].reduce(
    (modelGame, reducer) => reducer({ ...input, modelGame }),
    input.modelGame,
  )
}

export const PackBuilderGame = {
  reducer,
}
