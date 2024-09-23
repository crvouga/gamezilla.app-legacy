import { Sub } from 'gamezilla-app/@/core'
import type { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import type { SpaceServerCtx, SpaceServerEvt } from '../../@/space'
import type { SpaceServerCmd } from '../../@/space-server-cmd'
import type { ModelCore, ModelServer, MsgCore, MsgServer, MsgToClient, MsgToServer } from './connect-four.types'

//
//
//
//
//
//
//

type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
}>

//
//
//
// Model
//
//
//

const init: ServerModule['init'] = {
  t: null
}

//
//
//
// Update
//
//
//

const update: ServerModule['update'] = async (_input) => {
  return {}
}

//
//
//
// Subscriptions
//
//
//

const subscriptions: ServerModule['subscriptions'] = async (_input) => {
  return Sub.None
}

export const ConnectFourServer = {
  init,
  update,
  subscriptions
}
