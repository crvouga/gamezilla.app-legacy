import {
  SpaceClientEvent,
  SpaceServerCtx,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { FlowServerDeps } from "../../../@CHILD/create/create.core"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./flow-pack-puzzle-grid.core"
import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server"

type ServerModule = AppServerModule<{
  Ctx: SpaceServerCtx
  Model: ModelServer
  Msg: MsgServer
  MsgInCmd: null
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: FlowServerDeps
}>

const ListPuzzlesById: Pick<ServerModule, "update"> = {
  async update(input) {
    switch (input.msgClient?.t) {
      case "list-puzzles-by-id": {
        const listed = await input.deps.FlowPuzzleDb.list({
          pagination: {
            limit: Infinity,
            offset: 0,
          },
          order: {
            createdAt: "asc",
          },
          where: {
            puzzleId: {
              in: [],
            },
          },
        })
        return {
          model: input.model,
          msgCmd: [
            sendBack(input.msgClient, {
              t: "listed-puzzles-by-id",
              listed,
            }),
          ],
        }
      }
    }
    return { model: input.model }
  },
}

export const FlowPackPuzzleGridServer: Pick<ServerModule, "update"> = {
  async update(input) {
    return AppServerModule.chainUpdates(
      { model: input.model },
      (model) => ListPuzzlesById.update({ ...input, model }),
      //
    )
  },
}
