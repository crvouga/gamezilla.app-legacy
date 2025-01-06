import { Sub } from '~/@/sub'
import type { SpaceServerCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceServerCtx } from '~/app/spaces/@/space-server/ctx'
import { SpaceServerEvt } from '~/app/spaces/@/space-server/evt'
import type { GameServerModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
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
  t: null,
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
  subscriptions,
}
