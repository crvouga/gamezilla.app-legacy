import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ServerModule } from "../builder.core";
import { GameEvent } from "./puzzle-delete-forever.core";

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model })
  );
};

const updateFromClient: ServerModule["update"] = async (input) => {
  const { gameState, fromClient, model, deps } = input;

  if (gameState.t !== "build") {
    return { model };
  }

  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "delete-forever/user-confirmed": {
      const deleted = await deps.FlowPuzzleDb.zap(gameState.puzzle.id);

      const msgGameEvent: GameEvent = {
        t: "user-deleted-puzzle",
        flowPuzzleId: gameState.puzzle.id,
        userId: fromClient.userId,
        deleted,
      };

      return {
        model,
        msgGameEvent: [withId(msgGameEvent)],
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
