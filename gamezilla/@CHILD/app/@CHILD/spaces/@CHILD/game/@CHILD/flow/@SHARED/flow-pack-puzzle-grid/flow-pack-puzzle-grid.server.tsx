import {
  SpaceClientEvent,
  SpaceServerCtx,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { FlowServerDeps } from "../../@CHILD/builder/builder.core"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./flow-pack-puzzle-grid.core"

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

export const FlowPackPuzzleGridServer: Pick<ServerModule, "update"> = {
  async update(input) {
    return { model: input.model }
  },
}
