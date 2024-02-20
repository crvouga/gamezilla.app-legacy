import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showErrSm,
  showCreatedSm,
} from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Button,
  Drawer,
  IconArrowLeftOnRect,
  IconFloppyDisk,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { Result, isErr, isOk, loading } from "gamezilla/@SHARED/core"
import { FlowGridUIEdit } from "../../../../@SHARED/flow"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import {
  ModelClient,
  ClientModule,
  MsgClient,
  MsgSync,
} from "../../builder.core"
import { ViewBottomButtonBarAction } from "../../../../../../@SHARED/game"

//
//
//
//
//

const update: ClientModule["update"] = (input) => {
  const { model } = input
  return GameClientModule.chainUpdates(
    { model },
    (model) => updateExitBuilder({ ...input, model }),
    (model) => updateSaveChangesRequest({ ...input, model }),
    (model) => updatePuzzles({ ...input, model }),
  )
}

const updatePuzzles: ClientModule["update"] = ({ msgSync, model }) => {
  switch (msgSync?.t) {
    case "puzzle-builder.saved-puzzle": {
      if (isErr(msgSync.saved)) {
        return { model }
      }
      const puzzleNew = msgSync.saved.value

      return {
        model: {
          ...model,
          puzzles: {
            ...model.puzzles,
            [puzzleNew.id]: puzzleNew,
          },
        },
      }
    }

    default: {
      return { model }
    }
  }
}

const updateExitBuilder: ClientModule["update"] = (input) => {
  const { msg, model, modelSync, msgSync } = input

  switch (msg?.t) {
    case "puzzle-builder.user-clicked-exit-button": {
      if (!modelSync.puzzleBuilder) {
        return exitBuilderWithSound(input)
      }

      if (
        FlowGridUIEdit.isUnsavedChanges(
          modelSync.puzzleBuilder.gridEdit,
          modelSync.puzzleBuilder.puzzle.puzzle.c,
        )
      ) {
        return {
          model: { ...model, puzzleBuilderOpened: "unsaved-changes" },
          msgCmd: [playSound(APP_SOUND.alertErrorSm)],
        }
      }

      return exitBuilderWithSound(input)
    }

    case "puzzle-save-changes.user-clicked-cancel-exit": {
      return {
        model: { ...model, puzzleBuilderOpened: null },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case "puzzle-save-changes.user-clicked-discard-and-exit": {
      return exitBuilderWithSound(input)
    }

    case "puzzle-save-changes.user-clicked-save-and-exit": {
      return saveChanges({
        ...input,
        model: { ...model, puzzleSaveChangesIsExiting: true },
      })
    }

    default: {
      break
    }
  }

  switch (msgSync?.t) {
    case "puzzle-builder.saved-puzzle": {
      if (
        model.puzzleSaveChangesRequest?.t === "loading" &&
        model.puzzleSaveChangesIsExiting &&
        isOk(msgSync.saved)
      ) {
        return exitBuilder({
          ...input,
          model: {
            ...model,
            puzzleSaveChangesIsExiting: false,
            puzzleBuilderOpened: null,
          },
        })
      }
      return { model }
    }
    default: {
      break
    }
  }

  return { model }
}

const updateSaveChangesRequest: ClientModule["update"] = (input) => {
  const { model, msg, ctx, msgSync } = input

  if (msg?.t === "puzzle-save-changes.user-clicked-save-button") {
    return saveChanges(input)
  }

  if (
    msgSync?.t === "puzzle-builder.saved-puzzle" &&
    msgSync.userId === ctx.currentUserId
  ) {
    return {
      model: {
        ...model,
        puzzleSaveChangesRequest: Result.mapOk(msgSync.saved, () => null),
      },
      msgCmd: isOk(msgSync.saved)
        ? showCreatedSm("Saved changes")
        : showErrSm(msgSync.saved.error),
    }
  }
  return { model }
}

const exitBuilderWithSound: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => exitBuilder({ ...input, model }),
    (model) => ({ model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }),
  )
}

const exitBuilder: ClientModule["update"] = (input) => {
  const msgSync: MsgSync = {
    t: "puzzle-builder.user-clicked-exit-button",
    userId: input.ctx.currentUserId,
  }

  return {
    model: { ...input.model, puzzleBuilderOpened: null },
    msgSync: [withId(msgSync)],
  }
}

const saveChanges: ClientModule["update"] = ({ model, modelSync }) => {
  const puzzleBuilder = modelSync.puzzleBuilder

  if (!puzzleBuilder) {
    return { model }
  }

  const puzzleNew: FlowPuzzle = {
    ...puzzleBuilder.puzzle,
    puzzle: {
      t: "grid",
      c: FlowGridUIEdit.toCurrentGrid({
        model: puzzleBuilder.gridEdit,
      }),
    },
  }

  return {
    model: { ...model, puzzleSaveChangesRequest: loading },
    msgCmd: [
      playSound(APP_SOUND.tap),
      sendToServer({
        t: "puzzle-save-changes.user-clicked-save-button",
        puzzle: puzzleNew,
      }),
    ],
  }
}

//
//
//
//
//
//
//

export const ViewActionButtons = ({
  model,
  dispatch,
}: {
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  return (
    <>
      <ViewBottomButtonBarAction
        icon={<IconArrowLeftOnRect className="h-6 w-6" />}
        label="Exit"
        onClick={() =>
          dispatch({ t: "puzzle-builder.user-clicked-exit-button" })
        }
        disabled={model.puzzleSaveChangesRequest?.t === "loading"}
      />
      <ViewBottomButtonBarAction
        icon={<IconFloppyDisk className="h-6 w-6" />}
        label="Save"
        onClick={() =>
          dispatch({ t: "puzzle-save-changes.user-clicked-save-button" })
        }
        loading={model.puzzleSaveChangesRequest?.t === "loading"}
      />
    </>
  )
}

const ViewUnsavedChangesDrawer: ClientModule["View"] = ({
  model,
  dispatch,
}) => {
  return (
    <Drawer
      id="unsaved-changes-drawer"
      onClose={() =>
        dispatch({ t: "puzzle-save-changes.user-clicked-cancel-exit" })
      }
      open={model.puzzleBuilderOpened === "unsaved-changes"}
      position="bottom"
    >
      <p className="px-4 pt-4 text-3xl font-bold">Save changes?</p>
      <p className="p-4 text-secondary">
        Your changes will be lost if you don't save them before exiting.
      </p>
      <div className="flex w-full flex-col gap-4 p-4">
        <Button
          className="w-full"
          text="Save"
          variant="contained"
          color="primary"
          loading={model.puzzleSaveChangesRequest?.t === "loading"}
          onClick={() =>
            dispatch({
              t: "puzzle-save-changes.user-clicked-save-and-exit",
            })
          }
        />
        <Button
          className="w-full"
          text="Don't Save"
          onClick={() =>
            dispatch({
              t: "puzzle-save-changes.user-clicked-discard-and-exit",
            })
          }
        />
        <div className="w-full"></div>
        <Button
          className="w-full"
          text="Cancel"
          onClick={() =>
            dispatch({
              t: "puzzle-save-changes.user-clicked-cancel-exit",
            })
          }
        />
      </div>
    </Drawer>
  )
}

export const PuzzleSaveChangesClient = {
  ViewActionButtons: ViewActionButtons,
  update,
  ViewUnsavedChangesDrawer,
}
