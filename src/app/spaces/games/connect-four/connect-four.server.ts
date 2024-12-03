import { Sub } from '~/@/core'
import type { GameServerModule } from '~/app/spaces/games/@/architecture/game-server-v2'
import type { SpaceServerCmd } from '../../@/space-server-cmd'
import type { ModelCore, ModelServer, MsgCore, MsgServer, MsgToClient, MsgToServer } from './connect-four.types'
import { SpaceServerCtx } from '../../@/space-server-ctx'
import { SpaceServerEvt } from '../../@/space-server-evt'

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
