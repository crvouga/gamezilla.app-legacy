import { Sub } from "gamezilla/@SHARED/core"
import { GameServerModule } from "../../../../@SHARED/architecture/game-server-v2"
import { SpaceServerCtx, SpaceServerEvent } from "../../../../@SHARED/space"
import { SpaceServerCmd } from "../../../../@SHARED/space-server-cmd"
import {
  MsgSync,
  ModelSync,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./connect-four.core"

//
//
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
  MsgInCmd: null
  MsgInEvent: SpaceServerEvent
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: null
  Deps: null
}>

//
//
//
// Model
//
//
//

const init: Module["init"] = {
  t: null,
}

//
//
//
// Update
//
//
//

const update: Module["update"] = async (input) => {
  return {
    model: input.model,
  }
}

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module["subscriptions"] = async (_input) => {
  return Sub.None
}

export const ConnectFourServer: Module = {
  init,
  update,
  subscriptions,
  deps: async () => null,
}
