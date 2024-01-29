import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { Result } from "gamezilla/@SHARED/core";
import { ServerModule } from "../builder.core";
import { GameEvent } from "./puzzle-save-changes.core";

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model })
  );
};

const updateFromClient: ServerModule["update"] = async (input) => {
  const { ctx, fromClient, model, deps } = input;

  switch (fromClient?.t) {
    case "save-changes/user-clicked-save-and-exit":
    case "save-changes/user-clicked-save-button": {
      const saved = await deps.FlowPuzzleDb.put({
        ...fromClient.puzzle,
        lastUpdatedBy: fromClient.userId,
        lastUpdatedAt: ctx.now,
      });

      const msgGameEvent: GameEvent = {
        t: "user-saved-changes",
        saved: Result.mapOk(saved, () => fromClient.puzzle),
        userId: fromClient.puzzle.createdBy,
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

export const PuzzleSaveChangesServer = {
  update,
};
