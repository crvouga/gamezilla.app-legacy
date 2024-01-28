import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
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
  IconArrowLeftOnRect,
  IconFloppyDisk,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Result, isErr, isOk, loading } from "gamezilla/@SHARED/core";
import { FlowGridUIEdit } from "../../../@SHARED/flow";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";
import {
  ClientModel,
  ClientModule,
  ClientMsg,
  GameEvent,
} from "../puzzle-builder.core";
import { BottomBarButtonAction } from "../../../../../@SHARED/game";

//
//
//
//
//

const update: ClientModule["update"] = (input) => {
  const { model } = input;
  return GameClientModule.chainUpdates(
    { model },
    (model) => updateExitBuilder({ ...input, model }),
    (model) => updateSaveChangesRequest({ ...input, model }),
    (model) => updatePuzzles({ ...input, model })
  );
};

const updatePuzzles: ClientModule["update"] = ({ gameEvent, model }) => {
  switch (gameEvent?.t) {
    case "user-saved-changes": {
      if (isErr(gameEvent.saved)) {
        return { model };
      }
      const puzzleNew = gameEvent.saved.value;

      return {
        model: {
          ...model,
          puzzles: {
            ...model.puzzles,
            [puzzleNew.id]: puzzleNew,
          },
        },
      };
    }

    default: {
      return { model };
    }
  }
};

const updateExitBuilder: ClientModule["update"] = (input) => {
  const { msg, model, gameState, gameEvent } = input;

  if (gameState.t !== "build") {
    return { model };
  }

  switch (msg?.t) {
    case "builder/user-clicked-exit-button": {
      if (
        FlowGridUIEdit.isUnsavedChanges({
          grid: gameState.puzzle.puzzle.c,
          model: gameState.gridEdit,
        })
      ) {
        return {
          model: { ...model, opened: "unsaved-changes" },
          cmd: [playSound(APP_SOUND.alertErrorSm)],
        };
      }

      return exitBuilder(input);
    }

    case "save-changes/user-clicked-cancel-exit": {
      return {
        model: { ...model, opened: null },
        cmd: [playSound(APP_SOUND.tap)],
      };
    }

    case "save-changes/user-clicked-discard-and-exit": {
      return exitBuilder(input);
    }

    case "save-changes/user-clicked-save-and-exit": {
      return saveChanges({
        ...input,
        model: { ...model, saveChangesIsExiting: true },
      });
    }

    default: {
      break;
    }
  }

  switch (gameEvent?.t) {
    case "user-saved-changes": {
      if (
        model.saveChangesRequest?.t === "loading" &&
        model.saveChangesIsExiting
      ) {
        return exitBuilder({
          ...input,
          model: { ...model, saveChangesIsExiting: false, opened: null },
        });
      }
      return { model };
    }
    default: {
      break;
    }
  }

  return { model };
};

const updateSaveChangesRequest: ClientModule["update"] = (input) => {
  const { model, msg, ctx, gameEvent } = input;

  if (msg?.t === "save-changes/user-clicked-save-button") {
    return saveChanges(input);
  }

  if (
    gameEvent?.t === "user-saved-changes" &&
    gameEvent.userId === ctx.currentUserId
  ) {
    return {
      model: {
        ...model,
        saveChangesRequest: Result.mapOk(gameEvent.saved, () => null),
      },
      cmd: isOk(gameEvent.saved)
        ? showOkToast("Saved changes")
        : showErrorToast(gameEvent.saved.error),
    };
  }
  return { model };
};

const exitBuilder: ClientModule["update"] = (input) => {
  const gameEvent: GameEvent = {
    t: "user-exited-builder",
    userId: input.ctx.currentUserId,
  };

  return {
    model: { ...input.model, opened: null },
    gameEvent: [withId(gameEvent)],
  };
};

const saveChanges: ClientModule["update"] = ({ model, gameState }) => {
  if (gameState.t !== "build") {
    return { model };
  }

  const puzzleNew: FlowPuzzle = {
    ...gameState.puzzle,
    puzzle: {
      t: "grid",
      c: FlowGridUIEdit.toCurrentGrid({
        model: gameState.gridEdit,
      }),
    },
  };

  return {
    model: { ...model, saveChangesRequest: loading },
    cmd: [
      playSound(APP_SOUND.tap),
      sendToServer({
        t: "save-changes/user-clicked-save-button",
        puzzle: puzzleNew,
      }),
    ],
  };
};

//
//
//
//
//
//
//

export const viewActionButtons = ({
  model,
  dispatch,
}: {
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const exit: BottomBarButtonAction = {
    label: "Exit",
    disabled: model.saveChangesRequest?.t === "loading",
    icon: <IconArrowLeftOnRect className="h-6 w-6" />,
    onClick: () => dispatch({ t: "builder/user-clicked-exit-button" }),
  };

  const save: BottomBarButtonAction = {
    label: "Save",
    icon: <IconFloppyDisk className="h-6 w-6" />,
    loading: model.saveChangesRequest?.t === "loading",
    onClick: () => dispatch({ t: "save-changes/user-clicked-save-button" }),
  };

  return {
    exit,
    save,
  };
};

const ViewUnsavedChangesDrawer: ClientModule["View"] = ({
  model,
  dispatch,
}) => {
  return (
    <Drawer
      id="unsaved-changes-drawer"
      onClose={() => dispatch({ t: "save-changes/user-clicked-cancel-exit" })}
      open={model.opened === "unsaved-changes"}
      position="bottom"
    >
      <p className="px-4 pt-4 text-3xl font-bold">
        Save changes before exiting?
      </p>
      <p className="p-4 text-secondary">
        Your new changes will be lost forever if you don't save them before
        exiting.
      </p>
      <div className="flex w-full flex-col gap-4 p-4">
        <Button
          className="w-full"
          text="Save"
          variant="contained"
          color="primary"
          loading={model.saveChangesRequest?.t === "loading"}
          onClick={() =>
            dispatch({ t: "save-changes/user-clicked-save-and-exit" })
          }
        />
        <Button
          className="w-full"
          text="Don't Save"
          onClick={() =>
            dispatch({ t: "save-changes/user-clicked-discard-and-exit" })
          }
        />
        <div className="w-full"></div>
        <Button
          className="w-full"
          text="Cancel"
          onClick={() =>
            dispatch({ t: "save-changes/user-clicked-cancel-exit" })
          }
        />
      </div>
    </Drawer>
  );
};

export const PuzzleSaveChangesClient = {
  viewActionButtons,
  update,
  ViewUnsavedChangesDrawer,
};
