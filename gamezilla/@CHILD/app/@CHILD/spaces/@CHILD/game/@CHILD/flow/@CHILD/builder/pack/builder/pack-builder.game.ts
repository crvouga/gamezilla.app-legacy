import { isErr } from "gamezilla/@SHARED/core"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { SyncReducer } from "../../builder.core"
import { FlowGridUIPlay } from "../../../../@SHARED/flow"

const userCreatedPack: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "user-created-pack": {
      if (isErr(msgSync.created)) {
        return modelSync
      }

      return {
        ...modelSync,
        opened: { t: "pack-builder" },
        packBuilder: {
          t: "pack-builder",
          opened: { t: null },
          screen: {
            t: "pack",
            pageIndex: 0,
          },
          pack: msgSync.created.value,
        },
      }
    }
    default: {
      return modelSync
    }
  }
}

const userClickedExitButton: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-builder.user-clicked-exit-button": {
      return {
        puzzleBuilder: modelSync.puzzleBuilder,
        packBuilder: modelSync.packBuilder,
        opened: { t: "list" },
        listTab: "packs",
      }
    }
    default: {
      return modelSync
    }
  }
}

const useClickedAddPuzzleItem: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-builder.user-clicked-add-puzzle-item": {
      if (!modelSync.packBuilder) {
        return modelSync
      }
      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          pack: FlowPack.add(modelSync.packBuilder.pack, msgSync.puzzle.id),
          screen: {
            t: "pack",
            pageIndex: 0,
          },
          opened: {
            t: null,
          },
        },
      }
    }
    default: {
      return modelSync
    }
  }
}

const userClickedOpenAddPuzzleButton: SyncReducer = ({
  modelSync,
  msgSync,
}) => {
  switch (msgSync.t) {
    case "pack-builder.user-clicked-open-add-puzzle-button": {
      if (!modelSync.packBuilder) {
        return modelSync
      }
      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          opened: {
            t: "add-puzzle",
          },
        },
      }
    }
    default: {
      return modelSync
    }
  }
}

const userClosedAddPuzzle: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-builder.user-closed-add-puzzle": {
      if (!modelSync.packBuilder) {
        return modelSync
      }
      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          opened: {
            t: null,
          },
          screen: {
            t: "pack",
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

const userClickedPackItem: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-builder.user-clicked-pack-item": {
      if (!modelSync.packBuilder) {
        return modelSync
      }

      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          screen: {
            t: "puzzle",
            puzzleIndex: msgSync.index,
            puzzle: {
              t: "grid",
              flowGrid: msgSync.puzzle.puzzle.c,
              flowGridUIPlay: FlowGridUIPlay.init({
                grid: msgSync.puzzle.puzzle.c,
              }),
            },
          },
        },
      }
    }

    default: {
      return modelSync
    }
  }
}

const userClickedExitPuzzleButton: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-builder.user-clicked-exit-puzzle-button": {
      if (!modelSync.packBuilder) {
        return modelSync
      }

      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          screen: {
            t: "pack",
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

const flowGridUIPlay: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-builder.flow-play-grid-ui": {
      if (!modelSync.packBuilder) {
        return modelSync
      }

      if (modelSync.packBuilder.screen.t !== "puzzle") {
        return modelSync
      }

      const openedPuzzle = modelSync.packBuilder.screen.puzzle

      const updated = FlowGridUIPlay.update({
        grid: openedPuzzle.flowGrid,
        model: openedPuzzle.flowGridUIPlay,
        msg: msgSync.c,
      })

      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          screen: {
            t: "puzzle",
            puzzleIndex: modelSync.packBuilder.screen.puzzleIndex,
            puzzle: {
              t: "grid",
              flowGrid: openedPuzzle.flowGrid,
              flowGridUIPlay: updated,
            },
          },
        },
      }
    }
    default: {
      return modelSync
    }
  }
}

const reducer: SyncReducer = (input) => {
  return [
    flowGridUIPlay,
    userClosedAddPuzzle,
    userClickedOpenAddPuzzleButton,
    useClickedAddPuzzleItem,
    userCreatedPack,
    userClickedExitButton,
    userClickedPackItem,
    userClickedExitPuzzleButton,
    //
  ].reduce(
    (modelSync, reducer) => reducer({ ...input, modelSync }),
    input.modelSync,
  )
}

export const PackBuilderGame = {
  reducer,
}
