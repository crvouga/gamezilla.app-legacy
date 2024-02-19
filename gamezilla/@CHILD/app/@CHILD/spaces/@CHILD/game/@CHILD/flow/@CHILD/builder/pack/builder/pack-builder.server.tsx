import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { ServerModule } from "../../builder.core"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates(
    { model: input.model },
    (model) => updateSavePackOnChange({ ...input, model }),
    //
  )
}

const updateSavePackOnChange: ServerModule["update"] = async (input) => {
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
}

export const PackBuilderServer = {
  update,
}
