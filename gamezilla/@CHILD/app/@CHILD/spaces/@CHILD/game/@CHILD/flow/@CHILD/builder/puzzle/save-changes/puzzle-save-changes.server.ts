import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { Result } from "gamezilla/@SHARED/core"
import { ServerModule } from "../../builder.core"
import { MsgGame } from "./puzzle-save-changes.core"

const update: ServerModule["update"] = async (input) => {
    return GameServerModule.chainUpdates({ model: input.model }, (model) =>
        updateFromClient({ ...input, model }),
    )
}

const updateFromClient: ServerModule["update"] = async (input) => {
    const { ctx, msgClient, model, deps } = input

    switch (msgClient?.t) {
        case "puzzle-save-changes.user-clicked-save-and-exit":
        case "puzzle-save-changes.user-clicked-save-button": {
            const saved = await deps.FlowPuzzleDb.put({
                ...msgClient.puzzle,
                lastUpdatedBy: msgClient.userId,
                lastUpdatedAt: ctx.now,
            })

            const msgGame: MsgGame = {
                t: "user-saved-changes",
                saved: Result.mapOk(saved, () => msgClient.puzzle),
                userId: msgClient.puzzle.createdBy,
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

export const PuzzleSaveChangesServer = {
    update,
}
