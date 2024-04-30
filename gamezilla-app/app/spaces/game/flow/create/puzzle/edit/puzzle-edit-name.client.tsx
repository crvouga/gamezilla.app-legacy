import { GameClientModule } from "gamezilla-app/app/spaces/@shared/architecture/game-client-v2"
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showErrSm,
  showCreatedSm,
} from "gamezilla-app/app/@shared/client"
import {
  Button,
  Drawer,
  IconPenToSquare,
  ListItemButton,
  TextField,
} from "gamezilla-app/app/@shared/ui"
import { isLoading, isOk, loading } from "gamezilla-app/@/core"
import { FlowPuzzleName } from "../../../@shared/flow-puzzle/flow-puzzle-name"
import { ClientModule } from "../../create.core"
import { editNameValidationErrorToString } from "./puzzle-edit-name.core"
import { VDomChildren } from "gamezilla-app/@/vdom"

//
//
//
//
//
//

const update: ClientModule["update"] = (input) => {
  const { model } = input
  return GameClientModule.andThen(
    { model },
    (model) => updateDraftNameInput({ ...input, model }),
    (model) => updateDrawer({ ...input, model }),
    (model) => updateFormButtons({ ...input, model }),
  )
}

const View: ClientModule["View"] = (input) => {
  return (
    <ViewDrawer {...input}>
      <p className="px-4 pt-4 text-2xl font-bold">Edit name</p>
      <ViewDraftNameInput {...input} />
      <ViewFormButtons {...input} />
    </ViewDrawer>
  )
}

//
//
//
//
//

const updateFormButtons: ClientModule["update"] = (input) => {
  const { modelSync, msgSync, msg, model } = input

  const puzzleBuilder = modelSync.puzzleBuilder

  if (!puzzleBuilder) {
    return { model }
  }

  switch (msg?.t) {
    case "puzzle.edit-name.user-clicked-cancel-button": {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: "more",
          puzzleEditNameValidationError: null,
        },
      }
    }

    case "puzzle.edit-name.user-clicked-save-button": {
      const newName = model.puzzleEditNameDraft ?? ""

      if (newName.length === 0) {
        return {
          model: {
            ...model,
            puzzleEditNameValidationError: "name-cannot-be-empty",
          },
          msgCmd: [playSound(APP_SOUND.alertErrorSm)],
        }
      }

      return {
        model: {
          ...model,
          puzzleEditNameRequest: loading,
          puzzleEditNameValidationError: null,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: "puzzle.edit-name.user-clicked-save-button",
            newName,
            flowPuzzleId: puzzleBuilder.puzzle.id,
          }),
        ],
      }
    }

    default: {
      break
    }
  }

  switch (msgSync?.t) {
    case "user-edited-puzzle-name": {
      const puzzlesNew = { ...model.puzzles }
      const puzzle = puzzlesNew[msgSync.flowPuzzleId]

      if (puzzle && FlowPuzzleName.is(msgSync.newName)) {
        puzzlesNew[msgSync.flowPuzzleId] = {
          ...puzzle,
          name: msgSync.newName,
        }
      }

      return {
        model: {
          ...model,
          puzzles: puzzlesNew,
          puzzleEditNameRequest: msgSync.edited,
          puzzleBuilderOpened: null,
        },
        msgCmd: isOk(msgSync.edited)
          ? showCreatedSm("Saved name")
          : showErrSm(msgSync.edited.error),
      }
    }

    default: {
      break
    }
  }

  return { model }
}

const ViewFormButtons: ClientModule["View"] = ({
  dispatch,
  model,
  modelSync,
}) => {
  return (
    <div className="flex w-full items-center gap-4 p-4 pb-6">
      <Button
        className="flex-1"
        text="Cancel"
        onClick={() =>
          dispatch({
            t: "puzzle.edit-name.user-clicked-cancel-button",
          })
        }
      />
      <Button
        className="flex-1"
        color="primary"
        variant="contained"
        text="Save"
        loading={isLoading(model.puzzleEditNameRequest)}
        disabled={
          modelSync.opened.t !== "puzzle-builder" ||
          model.puzzleEditNameDraft === modelSync.puzzleBuilder?.puzzle.name
        }
        onClick={() =>
          dispatch({ t: "puzzle.edit-name.user-clicked-save-button" })
        }
      />
    </div>
  )
}

//
//
//
//
//

const updateDrawer: ClientModule["update"] = (input) => {
  const { msg, model, modelSync } = input

  switch (msg?.t) {
    case "puzzle.edit-name.user-clicked-button": {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: "edit-name",
          puzzleEditNameDraft: modelSync.puzzleBuilder?.puzzle.name ?? "",
        },
      }
    }

    case "puzzle.edit-name.user-closed-drawer": {
      return { model: { ...model, puzzleBuilderOpened: null } }
    }

    default: {
      return { model }
    }
  }
}

const ViewDrawer = (
  input: Parameters<ClientModule["View"]>[0] & { children: VDomChildren },
) => {
  const { children, dispatch, model } = input
  return (
    <>
      <ListItemButton
        icon={(props) => <IconPenToSquare {...props} />}
        label="Edit Name"
        onClick={() => dispatch({ t: "puzzle.edit-name.user-clicked-button" })}
      />

      <Drawer
        id="edit-name-drawer"
        open={model.puzzleBuilderOpened === "edit-name"}
        onClose={() => dispatch({ t: "puzzle.edit-name.user-closed-drawer" })}
        position="bottom"
      >
        {children}
      </Drawer>
    </>
  )
}

//
//
//
//
//
//

const updateDraftNameInput: ClientModule["update"] = ({ model, msg }) => {
  switch (msg?.t) {
    case "puzzle.edit-name.user-inputted-draft-name": {
      return {
        model: {
          ...model,
          puzzleEditNameDraft: msg.draftName,
          puzzleEditNameValidationError: null,
        },
      }
    }
    default: {
      return { model }
    }
  }
}

const ViewDraftNameInput: ClientModule["View"] = (input) => {
  return (
    <div className="w-full p-4">
      <TextField
        id="edit-name-input"
        label="Name"
        value={input.model.puzzleEditNameDraft}
        onChange={(draftName) =>
          input.dispatch({
            t: "puzzle.edit-name.user-inputted-draft-name",
            draftName,
          })
        }
        error={Boolean(input.model.puzzleEditNameValidationError)}
        helperText={editNameValidationErrorToString(
          input.model.puzzleEditNameValidationError,
        )}
      />
    </div>
  )
}

//
//
//
//
//
//

export const PuzzleEditNameClient = {
  update,
  View,
}
