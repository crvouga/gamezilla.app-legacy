import { Sub } from "gamezilla-app/@shared/core"
import { GameServerModule } from "../../@shared/architecture/game-server-v2"
import { SpaceServerCtx, SpaceServerEvent } from "../../@shared/space"
import { SpaceServerCmd } from "../../@shared/space-server-cmd"
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
