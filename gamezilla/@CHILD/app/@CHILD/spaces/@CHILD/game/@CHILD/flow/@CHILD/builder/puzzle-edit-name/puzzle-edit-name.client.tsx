import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showErrorToast,
  showOkToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  Drawer,
  IconPenToSquare,
  ListItemButton,
  TextField,
  VDomChildren,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { isLoading, isOk, loading } from "gamezilla/@SHARED/core";
import { ClientModule } from "../builder.core";
import { editNameValidationErrorToString } from "./puzzle-edit-name.core";

//
//
//
//
//
//

const update: ClientModule["update"] = (input) => {
  const { model } = input;
  return GameClientModule.chainUpdates(
    { model },
    (model) => updateDraftNameInput({ ...input, model }),
    (model) => updateDrawer({ ...input, model }),
    (model) => updateFormButtons({ ...input, model })
  );
};

const View: ClientModule["View"] = (input) => {
  return (
    <ViewDrawer {...input}>
      <p className="px-4 pt-4 text-2xl font-bold">Edit name</p>
      <ViewDraftNameInput {...input} />
      <ViewFormButtons {...input} />
    </ViewDrawer>
  );
};

//
//
//
//
//

const updateFormButtons: ClientModule["update"] = (input) => {
  const { modelGame, msgGame, msg, model } = input;

  if (modelGame.t !== "build") {
    return { model };
  }

  switch (msg?.t) {
    case "puzzle.edit-name.user-clicked-cancel-button": {
      return {
        model: { ...model, opened: "more", editNameValidationError: null },
      };
    }

    case "puzzle.edit-name.user-clicked-save-button": {
      const newName = model.editNameDraft ?? "";

      if (newName.length === 0) {
        return {
          model: { ...model, editNameValidationError: "name-cannot-be-empty" },
          msgCmd: [playSound(APP_SOUND.alertErrorSm)],
        };
      }

      return {
        model: {
          ...model,
          editNameRequest: loading,
          editNameValidationError: null,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: "puzzle.edit-name.user-clicked-save-button",
            newName,
            flowPuzzleId: modelGame.puzzle.id,
          }),
        ],
      };
    }

    default: {
      break;
    }
  }

  switch (msgGame?.t) {
    case "user-edited-puzzle-name": {
      const puzzlesNew = { ...model.puzzles };
      const puzzle = puzzlesNew[msgGame.flowPuzzleId];
      if (puzzle) {
        puzzlesNew[msgGame.flowPuzzleId] = {
          ...puzzle,
          name: msgGame.newName,
        };
      }

      return {
        model: {
          ...model,
          puzzles: puzzlesNew,
          editNameRequest: msgGame.edited,
          opened: null,
        },
        msgCmd: isOk(msgGame.edited)
          ? showOkToast("Saved name")
          : showErrorToast(msgGame.edited.error),
      };
    }

    default: {
      break;
    }
  }

  return { model };
};

const ViewFormButtons: ClientModule["View"] = ({
  dispatch,
  model,
  modelGame,
}) => {
  return (
    <div className="flex w-full items-center gap-4 p-4 pb-6">
      <Button
        className="flex-1"
        text="Cancel"
        onClick={() =>
          dispatch({ t: "puzzle.edit-name.user-clicked-cancel-button" })
        }
      />
      <Button
        className="flex-1"
        color="primary"
        variant="contained"
        text="Save"
        loading={isLoading(model.editNameRequest)}
        disabled={
          modelGame.t !== "build" ||
          model.editNameDraft === modelGame.puzzle.name
        }
        onClick={() =>
          dispatch({ t: "puzzle.edit-name.user-clicked-save-button" })
        }
      />
    </div>
  );
};

//
//
//
//
//

const updateDrawer: ClientModule["update"] = (input) => {
  const { msg, model, modelGame } = input;

  switch (msg?.t) {
    case "puzzle.edit-name.user-clicked-button": {
      return {
        model: {
          ...model,
          opened: "edit-name",
          editNameDraft: modelGame.t === "build" ? modelGame.puzzle.name : "",
        },
      };
    }

    case "puzzle.edit-name.user-closed-drawer": {
      return { model: { ...model, opened: null } };
    }

    default: {
      return { model };
    }
  }
};

const ViewDrawer = (
  input: Parameters<ClientModule["View"]>[0] & { children: VDomChildren }
) => {
  const { children, dispatch, model } = input;
  return (
    <>
      <ListItemButton
        icon={(props) => <IconPenToSquare {...props} />}
        label="Edit Name"
        onClick={() => dispatch({ t: "puzzle.edit-name.user-clicked-button" })}
      />

      <Drawer
        id="edit-name-drawer"
        open={model.opened === "edit-name"}
        onClose={() => dispatch({ t: "puzzle.edit-name.user-closed-drawer" })}
        position="bottom"
      >
        {children}
      </Drawer>
    </>
  );
};

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
          editNameDraft: msg.draftName,
          editNameValidationError: null,
        },
      };
    }
    default: {
      return { model };
    }
  }
};

const ViewDraftNameInput: ClientModule["View"] = ({ model, dispatch }) => {
  return (
    <div className="w-full p-4">
      <TextField
        id="edit-name-input"
        label="Name"
        value={model.editNameDraft}
        onChange={(draftName) =>
          dispatch({
            t: "puzzle.edit-name.user-inputted-draft-name",
            draftName,
          })
        }
        error={Boolean(model.editNameValidationError)}
        helperText={editNameValidationErrorToString(
          model.editNameValidationError
        )}
      />
    </div>
  );
};

//
//
//
//
//
//

export const PuzzleEditNameClient = {
  update,
  View,
};
