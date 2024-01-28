import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { err, isErr } from "gamezilla/@SHARED/core";
import { IFlowPuzzleDb } from "../../../@SHARED/flow-puzzle-db";
import { FlowPuzzleId } from "../../../@SHARED/flow-puzzle/flow-puzzle-id";
import { ServerModule } from "../puzzle-builder.core";
import { GameEvent } from "./edit-name.core";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model })
  );
};

const updateFromClient: ServerModule["update"] = async (input) => {
  const { fromClient, model, deps } = input;

  switch (fromClient?.t) {
    case "edit-name/user-clicked-save-button": {
      const edited = await patchName({
        deps,
        flowPuzzleId: fromClient.flowPuzzleId,
        newName: fromClient.newName,
        userId: fromClient.userId,
      });

      const gameEvent: GameEvent = {
        t: "user-edited-puzzle-name",
        edited,
        flowPuzzleId: fromClient.flowPuzzleId,
        newName: fromClient.newName,
        userId: fromClient.userId,
      };

      return {
        model,
        gameEvent: [withId(gameEvent)],
      };
    }

    default: {
      return { model };
    }
  }
};

const patchName = async (input: {
  flowPuzzleId: FlowPuzzleId;
  newName: string;
  userId: UserId;
  deps: { FlowPuzzleDb: IFlowPuzzleDb };
}) => {
  const { flowPuzzleId, newName, userId, deps } = input;

  const result = await deps.FlowPuzzleDb.get(flowPuzzleId);

  if (isErr(result)) {
    return result;
  }

  const puzzle = result.value;

  if (!puzzle) {
    return err("Failed to find puzzle");
  }

  if (puzzle.createdBy !== userId) {
    return err("You must be the creator of this puzzle to edit it.");
  }

  const patched: FlowPuzzle = {
    ...puzzle,
    name:
      typeof newName === "string" && newName.length > 0 ? newName : puzzle.name,
    lastUpdatedBy: userId,
  };

  const put = await deps.FlowPuzzleDb.put(patched);

  return put;
};

export const EditNameServer: Pick<ServerModule, "update"> = {
  update,
};
