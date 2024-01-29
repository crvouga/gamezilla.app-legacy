import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ServerModule } from "../builder.core";
import { GameMsg } from "./puzzle-delete-forever.core";

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model })
  );
};

const updateFromClient: ServerModule["update"] = async (input) => {
  const { modelGame, msgFromClient, model, deps } = input;

  if (modelGame.t !== "build") {
    return { model };
  }

  if (!msgFromClient) {
    return { model };
  }

  switch (msgFromClient.t) {
    case "delete-forever/user-confirmed": {
      const deleted = await deps.FlowPuzzleDb.zap(modelGame.puzzle.id);

      const msgGame: GameMsg = {
        t: "user-deleted-puzzle",
        flowPuzzleId: modelGame.puzzle.id,
        userId: msgFromClient.userId,
        deleted,
      };

      return {
        model,
        msgGame: [withId(msgGame)],
      };
    }

    default: {
      return { model };
    }
  }
};

export const PuzzleDeleteForeverServer: Pick<ServerModule, "update"> = {
  update,
};
