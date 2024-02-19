import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { ServerModule } from "../../builder.core"
import { MsgSync } from "./puzzle-delete-forever.core"

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model }),
  )
}

const updateFromClient: ServerModule["update"] = async (input) => {
  const { modelSync, msgClient, model, deps } = input

  switch (msgClient?.t) {
    case "delete-forever/user-confirmed": {
      const puzzleBuilder = modelSync.puzzleBuilder

      if (!puzzleBuilder) {
        return { model }
      }

      const deleted = await deps.FlowPuzzleDb.zap({
        id: puzzleBuilder.puzzle.id,
        deletedByUserId: msgClient.userId,
      })

      const msgSync: MsgSync = {
        t: "user-deleted-puzzle",
        flowPuzzleId: puzzleBuilder.puzzle.id,
        userId: msgClient.userId,
        deleted,
      }

      return {
        model,
        msgSync: [withId(msgSync)],
      }
    }

    default: {
      return { model }
    }
  }
}

export const PuzzleDeleteForeverServer: Pick<ServerModule, "update"> = {
  update,
}
