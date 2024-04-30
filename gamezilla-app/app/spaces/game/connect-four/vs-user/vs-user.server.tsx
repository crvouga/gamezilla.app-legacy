import { GameServerModule } from "gamezilla-app/app/spaces/@SHARED/architecture/game-server-v2"
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla-app/app/spaces/@SHARED/space"
import { SpaceServerCmd } from "gamezilla-app/app/spaces/@SHARED/space-server-cmd"
import { Sub } from "gamezilla-app/@SHARED/core"
import {
  MsgSync,
  ModelSync,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./vs-user.core"

//
//
//
//
//

type Module = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelSync: ModelSync
  MsgSync: MsgSync
  Ctx: SpaceServerCtx
  Deps: null
  MsgInCmd: null
  MsgInEvent: SpaceServerEvent
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: null
}>

export const init: Module["init"] = null

export const update: Module["update"] = async (input) => {
  return { model: input.model }
}

export const subscriptions: Module["subscriptions"] = async (_input) => {
  return Sub.None
}
