import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { Sub } from "gamezilla/@SHARED/core"
import {
  MsgSync,
  ModelSync,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./play.core"
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"

type Module = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgSync: MsgSync
  ModelSync: ModelSync
  Ctx: SpaceServerCtx
  MsgInCmd: null
  MsgInEvent: SpaceServerEvent
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: null
  Deps: null
}>

const init: Module["init"] = async () => {
  return {
    model: {},
  }
}

const update: Module["update"] = async (input) => {
  return {
    model: input.model,
  }
}

const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None
}

export const PlayServer: Module = {
  init,
  update,
  subscriptions,
  deps: async () => null,
}
