import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack";
import { FlowPackId } from "../../../../@SHARED/flow-pack/flow-pack-id";
import { FlowPackName } from "../../../../@SHARED/flow-pack/flow-pack-name";
import { ServerModule } from "../../builder.core";

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model })
  );
};

const updateFromClient: ServerModule["update"] = async (input) => {
  const { model, msgClient, ctx, deps } = input;

  switch (msgClient?.t) {
    case "pack-create/user-clicked-create-button": {
      const counted = await deps.FlowPackDb.count({
        where: {
          createdBy: msgClient.userId,
        },
      });

      if (counted.t === "err") {
        return { model };
      }

      const packNew: FlowPack = {
        createdAt: ctx.now,
        createdBy: msgClient.userId,
        id: FlowPackId.generate(),
        lastUpdatedAt: ctx.now,
        lastUpdatedBy: msgClient.userId,
        name: FlowPackName.generate({ count: counted.value }),
        puzzleIds: [],
      };

      const put = await deps.FlowPackDb.put(packNew);

      return {
        model: {
          ...model,
        },
        msgGame: [
          withId({
            t: "user-created-pack",
            created: put,
            userId: msgClient.userId,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

export const PackCreateServer = {
  update,
};
