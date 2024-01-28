import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { sendToSpace } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { Sub } from "gamezilla/@SHARED/core";
import { FlowPuzzleDb } from "../../@SHARED/flow-puzzle-db";
import { ServerModule } from "./puzzle-builder.core";
import { PuzzleDeleteForeverServer } from "./puzzle-delete-forever/puzzle-delete-forever.server";
import { PuzzleEditNameServer } from "./puzzle-edit-name/puzzle-edit-name.server";
import { PuzzleListServer } from "./puzzle-list/puzzle-list.server";
import { PuzzleSaveChangesServer } from "./puzzle-save-changes/puzzle-save-changes.server";

const deps: ServerModule["deps"] = async () => {
  return {
    FlowPuzzleDb: FlowPuzzleDb(),
  };
};

const init: ServerModule["init"] = {};

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromGameEvent({ ...input, model }),
    (model) => PuzzleListServer.update({ ...input, model }),
    (model) => PuzzleDeleteForeverServer.update({ ...input, model }),
    (model) => PuzzleEditNameServer.update({ ...input, model }),
    (model) => PuzzleSaveChangesServer.update({ ...input, model })
  );
};

const updateFromGameEvent: ServerModule["update"] = async (input) => {
  const { gameEvent, model } = input;

  if (!gameEvent) {
    return { model };
  }

  switch (gameEvent.t) {
    case "user-created-new-puzzle": {
      const put = await FlowPuzzleDb().put(gameEvent.puzzle);
      return {
        model: input.model,
        cmd: [
          sendToSpace({ t: "put-puzzle", put, reason: "user-created-puzzle" }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

const subscriptions: ServerModule["subscriptions"] = async () => {
  return Sub.None;
};

export const PuzzleBuilderServer: ServerModule = {
  deps,
  init,
  update,
  subscriptions,
};
