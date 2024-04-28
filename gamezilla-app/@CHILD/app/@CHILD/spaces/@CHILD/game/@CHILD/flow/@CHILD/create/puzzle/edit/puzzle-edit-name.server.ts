import { GameServerModule } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { withId } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Err, isErr } from "gamezilla-app/@SHARED/core"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { IFlowPuzzleDb } from "../../../../@SHARED/flow-puzzle/flow-puzzle-db"
import { FlowPuzzleId } from "../../../../@SHARED/flow-puzzle/flow-puzzle-id"
import { FlowPuzzleName } from "../../../../@SHARED/flow-puzzle/flow-puzzle-name"
import { ServerModule } from "../../create.core"
import { MsgSync } from "./puzzle-edit-name.core"

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.andThen({ model: input.model }, (model) =>
    updateFromClient({ ...input, model }),
  )
}

const updateFromClient: ServerModule["update"] = async (input) => {
  const { msgClient, model, deps } = input

  switch (msgClient?.t) {
    case "puzzle.edit-name.user-clicked-save-button": {
      const edited = await patchName({
        deps,
        flowPuzzleId: msgClient.flowPuzzleId,
        newName: msgClient.newName,
        userId: msgClient.userId,
      })

      const msgSync: MsgSync = {
        t: "user-edited-puzzle-name",
        edited,
        flowPuzzleId: msgClient.flowPuzzleId,
        newName: msgClient.newName,
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

const patchName = async (input: {
  flowPuzzleId: FlowPuzzleId
  newName: string
  userId: UserId
  deps: { FlowPuzzleDb: IFlowPuzzleDb }
}) => {
  const { flowPuzzleId, newName, userId, deps } = input

  const result = await deps.FlowPuzzleDb.get(flowPuzzleId)

  if (isErr(result)) {
    return result
  }

  const puzzle = result.value

  if (!puzzle) {
    return Err("Failed to find puzzle")
  }

  if (puzzle.createdBy !== userId) {
    return Err("You must be the creator of this puzzle to edit it.")
  }

  const newNameFinal =
    typeof newName === "string" && newName.length > 0 ? newName : puzzle.name

  if (!FlowPuzzleName.is(newNameFinal)) {
    return Err("Invalid name")
  }

  const patched: FlowPuzzle = {
    ...puzzle,
    name: newNameFinal,
    lastUpdatedBy: userId,
  }

  const put = await deps.FlowPuzzleDb.put(patched)

  return put
}

export const PuzzleEditNameServer: Pick<ServerModule, "update"> = {
  update,
}
