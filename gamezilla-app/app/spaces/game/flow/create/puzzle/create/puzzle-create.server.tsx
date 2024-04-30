import { Result, isErr } from "gamezilla-app/@SHARED/core"
import { GameServerModule } from "gamezilla-app/app/spaces/@SHARED/architecture/game-server-v2"
import { withId } from "gamezilla-app/app/spaces/@SHARED/event"
import { FlowVariant, FlowVariantDimensions } from "../../../@SHARED/flow"
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle"
import { ServerModule } from "../../create.core"
import { MsgSync } from "./puzzle-create.core"

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.andThen({ model: input.model }, (model) =>
    updateFromClient({ ...input, model }),
  )
}

const updateFromClient: ServerModule["update"] = async (input) => {
  const { msgClient, model, ctx, deps } = input

  switch (msgClient?.t) {
    case "puzzle-create.user-clicked-create-button": {
      const counted = await deps.FlowPuzzleDb.count({
        where: {
          createdBy: {
            equals: msgClient.userId,
          },
        },
      })

      if (isErr(counted)) {
        console.error(counted.error)
      }

      const count = Result.withDefault(counted, 0)

      const puzzleNew = await FlowPuzzle.create({
        count: count,
        createdAt: ctx.now,
        createdBy: msgClient.userId,
        flow: FlowVariant.init({
          terminalsByGroupId: {},
          dimensions: FlowVariantDimensions.init({
            t: "flow-grid",
            height: 8,
            width: 8,
          }),
        }),
      })

      const created = await deps.FlowPuzzleDb.put(puzzleNew)

      const msgSync: MsgSync = {
        t: "user-created-puzzle",
        created: Result.mapOk(created, () => puzzleNew),
        userId: msgClient.userId,
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

export const PuzzleCreateServer = {
  update,
}
