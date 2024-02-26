import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { ServerModule } from "../../create.core"

const SavePack: Pick<ServerModule, "update"> = {
  async update(input) {
    const { deps, model, modelSync, msgSync } = input
    switch (msgSync?.t) {
      case "pack-builder.user-clicked-add-puzzle-item": {
        if (!modelSync.packBuilder) {
          return { model }
        }

        const saved = await deps.FlowPackDb.put(modelSync.packBuilder.pack)

        return {
          model,
          msgSync: [withId({ t: "pack-builder.saved-pack", saved })],
        }
      }
      default: {
        return { model }
      }
    }
  },
}

export const PackBuilderServer: Pick<ServerModule, "update"> = {
  async update(input) {
    return GameServerModule.chainUpdates(
      { model: input.model },
      (model) => SavePack.update({ ...input, model }),
      //
    )
  },
}
