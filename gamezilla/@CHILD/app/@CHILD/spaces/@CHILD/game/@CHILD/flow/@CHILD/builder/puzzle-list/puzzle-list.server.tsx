import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server";
import { ServerModule } from "../builder.core";

const update: ServerModule["update"] = async (input) => {
  const { msgFromClient, model, deps } = input;
  if (!msgFromClient) {
    return { model };
  }

  switch (msgFromClient.t) {
    case "list/list-puzzles": {
      const listed = await deps.FlowPuzzleDb.list(msgFromClient.input);

      return {
        model: input.model,
        msgCmd: [sendBack(msgFromClient, { t: "list/listed-puzzle", listed })],
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
