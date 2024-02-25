import { isErr } from "gamezilla/@SHARED/core"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { SyncReducer } from "../../create.core"
import { FlowVariantUIPlay } from "../../../../@SHARED/flow"

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
            t: "screen-puzzle-grid",
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

const userClickedAddPuzzleItem: SyncReducer = ({ modelSync, msgSync }) => {
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
            t: "screen-puzzle-grid",
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
          screen: {
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
            t: "screen-puzzle",
            puzzleIndex: msgSync.index,
            puzzle: msgSync.puzzle,
            playUI: FlowVariantUIPlay.init({
              flow: msgSync.puzzle.flow,
            }),
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

const flowGridUIPlay: SyncReducer = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "pack-builder.flow-play-ui": {
      if (!modelSync.packBuilder) {
        return modelSync
      }

      if (modelSync.packBuilder.screen.t !== "screen-puzzle") {
        return modelSync
      }

      const screen = modelSync.packBuilder.screen

      const updated = FlowVariantUIPlay.update({
        flow: screen.puzzle.flow,
        model: screen.playUI,
        msg: msgSync.c,
      })

      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          screen: {
            t: "screen-puzzle",
            puzzleIndex: modelSync.packBuilder.screen.puzzleIndex,
            puzzle: modelSync.packBuilder.screen.puzzle,
            playUI: updated,
          },
        },
      }
    }
    default: {
      return modelSync
    }
  }
}

const userClickedNextPuzzleButton: SyncReducer = ({ modelSync, msgSync }) => {
  if (modelSync.packBuilder?.screen.t !== "screen-puzzle") {
    return modelSync
  }

  switch (msgSync.t) {
    case "pack-builder.user-clicked-next-puzzle-button": {
      return {
        ...modelSync,
        packBuilder: {
          ...modelSync.packBuilder,
          screen: {
            t: "screen-puzzle",
            puzzleIndex: modelSync.packBuilder.screen.puzzleIndex + 1,
            playUI: FlowVariantUIPlay.init({
              flow: modelSync.packBuilder.screen.puzzle.flow,
            }),
            puzzle: modelSync.packBuilder.screen.puzzle,
          },
        },
      }
    }

    default: {
      return modelSync
    }
  }
}

const userClickedPreviousPuzzleButton: SyncReducer = ({
  modelSync,
  msgSync,
}) => {
  switch (msgSync.t) {
    case "pack-builder.user-clicked-previous-puzzle-button": {
      return modelSync
    }
    default: {
      return modelSync
    }
  }
}

const reducer: SyncReducer = (input) => {
  return [
    flowGridUIPlay,
    userClickedPreviousPuzzleButton,
    userClickedNextPuzzleButton,
    userClosedAddPuzzle,
    userClickedOpenAddPuzzleButton,
    userClickedAddPuzzleItem,
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
