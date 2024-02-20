import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { ServerModule } from "../../builder.core"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server"
import { Result } from "gamezilla/@SHARED/core"

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates(
    { model: input.model },
    (model) => updateSavePackOnChange({ ...input, model }),
    (model) => updateListPuzzlesById({ ...input, model }),
    //
  )
}

const updateListPuzzlesById: ServerModule["update"] = async (input) => {
  const { deps, model, msgClient } = input
  switch (msgClient?.t) {
    case "pack-builder.list-puzzles-by-id": {
      const listed = await deps.FlowPuzzleDb.list({
        order: {
          createdAt: "asc",
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
        where: {
          puzzleId: {
            in: msgClient.puzzleIds,
          },
        },
      })

      return {
        model,
        msgCmd: [
          sendBack(msgClient, {
            t: "pack-builder.list-puzzles-by-id",
            listed: Result.mapOk(listed, (value) => value.items),
          }),
        ],
      }
    }
    default: {
      return { model }
    }
  }
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
