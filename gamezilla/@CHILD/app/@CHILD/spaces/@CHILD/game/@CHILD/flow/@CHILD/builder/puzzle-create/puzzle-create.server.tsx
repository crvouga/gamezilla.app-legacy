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
  const { msgFromClient, model, ctx } = input;

  switch (msgFromClient?.t) {
    case "puzzle-create/user-clicked-create-button": {
      const counted = await FlowPuzzleDb().count({
        where: {
          createdBy: msgFromClient.userId,
        },
      });

      const count = counted.t === "ok" ? counted.value : null;

      const puzzleName = FlowPuzzleName.generate();

      const puzzleNameFinal =
        typeof count === "number"
          ? `Puzzle ${count + 1} - ${puzzleName}`
          : puzzleName;

      const puzzleNew: FlowPuzzle = {
        createdAt: ctx.now,
        createdBy: msgFromClient.userId,
        id: FlowPuzzleId.generate(),
        lastUpdatedAt: ctx.now,
        lastUpdatedBy: msgFromClient.userId,
        name: puzzleNameFinal,
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

      const msgGameEvent: GameEvent = {
        t: "user-created-puzzle",
        created: Result.mapOk(created, () => puzzleNew),
        userId: msgFromClient.userId,
      };

      return {
        model: input.model,
        msgGameEvent: [withId(msgGameEvent)],
      };
    }

    default: {
      return { model };
    }
  }
};

export const PuzzleCreateServer = {
  update,
};
