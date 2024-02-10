import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { Result } from "gamezilla/@SHARED/core"
import { FlowGrid } from "../../../../@SHARED/flow"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { ServerModule } from "../../builder.core"
import { MsgGame } from "./puzzle-create.core"

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromClient({ ...input, model }),
  )
}

const updateFromClient: ServerModule["update"] = async (input) => {
  const { msgClient, model, ctx, deps } = input

  switch (msgClient?.t) {
    case "puzzle-create.user-clicked-create-button": {
      const counted = await deps.FlowPuzzleDb.count({
        where: {
          createdBy: msgClient.userId,
        },
      })

      const count = counted.t === "ok" ? counted.value : 0

      const puzzleNew = FlowPuzzle.create({
        count: count,
        createdAt: ctx.now,
        createdBy: msgClient.userId,
        puzzle: {
          t: "grid",
          c: FlowGrid.init({
            height: 8,
            width: 8,
            terminalsByGroupId: {},
          }),
        },
      })

      const created = await deps.FlowPuzzleDb.put(puzzleNew)

      const msgGame: MsgGame = {
        t: "user-created-puzzle",
        created: Result.mapOk(created, () => puzzleNew),
        userId: msgClient.userId,
      }

      return {
        model,
        msgGame: [withId(msgGame)],
      }
    }

    default: {
      return { model }
    }
  }
}

export const PuzzleCreateServer = {
  update,
}
