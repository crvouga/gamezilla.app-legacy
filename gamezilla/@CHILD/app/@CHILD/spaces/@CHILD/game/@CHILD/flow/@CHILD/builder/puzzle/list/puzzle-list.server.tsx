import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server";
import { ServerModule } from "../../builder.core";

const update: ServerModule["update"] = async (input) => {
  const { msgClient, model, deps } = input;
  if (!msgClient) {
    return { model };
  }

  switch (msgClient.t) {
    case "list/list-puzzles": {
      const listed = await deps.FlowPuzzleDb.list(msgClient.input);

      return {
        model: input.model,
        msgCmd: [sendBack(msgClient, { t: "list/listed-puzzle", listed })],
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
