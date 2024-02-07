import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { ServerModule } from "../../builder.core";

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model })
  );
};

const updateFromClient: ServerModule["update"] = async (input) => {
  const { model, msgClient } = input;

  switch (msgClient?.t) {
    case "pack-create/user-clicked-create-button": {
      return {
        model: {
          ...model,
        },
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
