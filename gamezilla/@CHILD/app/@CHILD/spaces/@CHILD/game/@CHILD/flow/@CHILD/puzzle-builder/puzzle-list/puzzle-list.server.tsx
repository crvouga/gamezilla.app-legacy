import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server";
import { ServerModule } from "../puzzle-builder.core";

const update: ServerModule["update"] = async (input) => {
  const { fromClient, model, deps } = input;
  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "list/list-puzzles": {
      const listed = await deps.FlowPuzzleDb.list(fromClient.input);

      return {
        model: input.model,
        cmd: [sendBack(fromClient, { t: "list/listed-puzzle", listed })],
      };
    }

    default: {
      return { model };
    }
  }
};

export const PuzzleListServer = {
  update,
};
