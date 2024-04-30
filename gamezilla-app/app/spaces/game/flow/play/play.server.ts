import { GameServerModule } from "gamezilla-app/app/spaces/@shared/architecture/game-server-v2"
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla-app/app/spaces/@shared/space"
import { Sub } from "gamezilla-app/@shared/core"
import {
  MsgSync,
  ModelSync,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./play.core"
import { SpaceServerCmd } from "gamezilla-app/app/spaces/@shared/space-server-cmd"

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
