import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showOkToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  ConfirmationDrawer,
  IconDeleteForever,
  ListItemButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { RemoteResult, isLoading } from "gamezilla/@SHARED/core";
import { ClientModule } from "../builder.core";

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromGameEvent({ ...input, model })
  );
};

const updateFromMsg: ClientModule["update"] = (input) => {
  const { msg, model, gameState } = input;

  if (gameState.t !== "build") {
    return { model };
  }

  switch (msg?.t) {
    case "delete-forever/user-clicked-delete-button": {
      return {
        model: { ...model, opened: "delete-forever" },
        cmd: [playSound(APP_SOUND.alertErrorSm)],
      };
    }

    case "delete-forever/user-closed-drawer": {
      return { model: { ...model, opened: null } };
    }

    case "delete-forever/user-clicked-cancel-button": {
      return { model: { ...model, opened: "more" } };
    }

    case "delete-forever/user-clicked-confirm-button": {
      return {
        model: { ...model, deleteForeverRequest: RemoteResult.loading },
        cmd: [
          sendToServer({ t: "delete-forever/user-confirmed" }),
          playSound(APP_SOUND.tap),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

const updateFromGameEvent: ClientModule["update"] = (input) => {
  const { gameEvent, model } = input;

  switch (gameEvent?.t) {
    case "user-deleted-puzzle": {
      const puzzlesNew = { ...model.puzzles };
      delete puzzlesNew[gameEvent.flowPuzzleId];
      return {
        model: {
          ...model,
          puzzles: puzzlesNew,
          deleteForeverRequest: gameEvent.deleted,
          opened: null,
        },
        cmd: showOkToast("Deleted puzzle"),
      };
    }

    default: {
      return { model };
    }
  }
};

const View: ClientModule["View"] = (input) => {
  const { model, dispatch } = input;
  return (
    <>
      <ListItemButton
        icon={(props) => <IconDeleteForever {...props} />}
        label="Delete Forever"
        color="danger"
        onClick={() =>
          dispatch({ t: "delete-forever/user-clicked-delete-button" })
        }
      />

      <ConfirmationDrawer
        id="delete-forever-drawer"
        open={
          input.model.opened === "delete-forever" ||
          isLoading(model.deleteForeverRequest)
        }
        onClose={() => dispatch({ t: "delete-forever/user-closed-drawer" })}
        variant="danger"
        position="bottom"
        title="Delete puzzle forever?"
        body="This action cannot be undone."
        //
        confirmLoading={isLoading(model.deleteForeverRequest)}
        confirmText="Delete Forever"
        onConfirm={() =>
          dispatch({ t: "delete-forever/user-clicked-confirm-button" })
        }
        //
        cancelDisabled={isLoading(model.deleteForeverRequest)}
        onCancel={() =>
          dispatch({ t: "delete-forever/user-clicked-cancel-button" })
        }
      />
    </>
  );
};

export const PuzzleDeleteForeverClient: Pick<ClientModule, "update" | "View"> =
  {
    update,
    View,
  };
