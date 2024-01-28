import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { ConfirmationDrawer } from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientModule } from "../puzzle-builder.core";

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
    case "delete-forever/user-clicked-button": {
      return {
        model: { ...model, opened: "delete-forever" },
        cmd: [playSound(APP_SOUND.alertErrorSm)],
      };
    }

    case "delete-forever/user-closed-drawer": {
      return { model: { ...model, opened: null } };
    }

    case "delete-forever/user-confirmed": {
      return {
        model,
        cmd: [sendToServer({ t: "delete-forever/user-confirmed" })],
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
        model: { ...model, puzzles: puzzlesNew },
        cmd: [showToast("Deleted puzzle")],
      };
    }

    default: {
      return { model };
    }
  }
};

const View: ClientModule["View"] = (input) => {
  const { dispatch } = input;
  return (
    <ConfirmationDrawer
      id="delete-forever-drawer"
      open={input.model.opened === "delete-forever"}
      onClose={() => dispatch({ t: "delete-forever/user-closed-drawer" })}
      variant="danger"
      position="bottom"
      title="Delete puzzle forever?"
      body="This action cannot be undone."
      onCancel={() => dispatch({ t: "delete-forever/user-closed-drawer" })}
      confirmText="Delete Forever"
      onConfirm={() => dispatch({ t: "delete-forever/user-confirmed" })}
    />
  );
};

export const DeleteForeverClient: Pick<ClientModule, "update" | "View"> = {
  update,
  View,
};
