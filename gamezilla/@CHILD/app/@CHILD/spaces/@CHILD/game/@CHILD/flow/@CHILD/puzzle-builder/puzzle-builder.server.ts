import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { sendToSpace } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server";
import { Sub } from "gamezilla/@SHARED/core";
import { FlowPuzzleDb } from "../../@SHARED/flow-puzzle-db";
import { DeleteForeverServer } from "./delete-forever/delete-forever.server";
import { EditNameServer } from "./edit-name/edit-name.server";
import { ServerModule } from "./puzzle-builder.core";
import { SaveChangesServer } from "./save-changes/save-changes.server";

const deps: ServerModule["deps"] = async () => {
  return {
    FlowPuzzleDb: FlowPuzzleDb(),
  };
};

const init: ServerModule["init"] = {};

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromGameEvent({ ...input, model }),
    (model) => DeleteForeverServer.update({ ...input, model }),
    (model) => EditNameServer.update({ ...input, model }),
    (model) => SaveChangesServer.update({ ...input, model })
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

const updateFromClient: ServerModule["update"] = async (input) => {
  const { fromClient, model } = input;
  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "list-puzzles": {
      const listed = await FlowPuzzleDb().list(fromClient.input);

      return {
        model: input.model,
        cmd: [sendBack(fromClient, { t: "listed-puzzle", listed })],
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
