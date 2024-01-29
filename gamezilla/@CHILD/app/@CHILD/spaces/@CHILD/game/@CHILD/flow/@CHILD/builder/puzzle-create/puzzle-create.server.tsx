import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { Result } from "gamezilla/@SHARED/core";
import { FlowGrid } from "../../../@SHARED/flow";
import { FlowPuzzleDb } from "../../../@SHARED/flow-puzzle-db";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";
import { FlowPuzzleId } from "../../../@SHARED/flow-puzzle/flow-puzzle-id";
import { FlowPuzzleName } from "../../../@SHARED/flow-puzzle/flow-puzzle-name";
import { ServerModule } from "../builder.core";
import { GameEvent } from "./puzzle-create.core";

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model })
  );
};

const updateFromClient: ServerModule["update"] = async (input) => {
  const { fromClient, model, ctx } = input;

  switch (fromClient?.t) {
    case "puzzle-create/user-clicked-create-button": {
      const puzzleName = FlowPuzzleName.generate();

      const puzzleNew: FlowPuzzle = {
        createdAt: ctx.now,
        createdBy: fromClient.userId,
        id: FlowPuzzleId.generate(),
        lastUpdatedAt: ctx.now,
        lastUpdatedBy: fromClient.userId,
        name: puzzleName,
        puzzle: {
          t: "grid",
          c: FlowGrid.init({
            height: 8,
            width: 8,
            terminalsByGroupId: {},
          }),
        },
      };

      const created = await FlowPuzzleDb().put(puzzleNew);

      const gameEvent: GameEvent = {
        t: "user-created-puzzle",
        created: Result.mapOk(created, () => puzzleNew),
        userId: fromClient.userId,
      };

      return {
        model: input.model,
        gameEvent: [withId(gameEvent)],
      };
    }

    default: {
      return { model };
    }
  }
};

export const BuilderServer = {
  update,
};
