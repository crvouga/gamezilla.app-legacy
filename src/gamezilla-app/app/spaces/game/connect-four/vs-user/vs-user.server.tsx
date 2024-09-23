import type { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import type { SpaceServerCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { Sub } from 'gamezilla-app/@/core'
import type { MsgCore, ModelCore, ModelServer, MsgServer, MsgToClient, MsgToServer } from './vs-user.types'

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
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceServerCtx
  Deps: null
  MsgCmdIn: null
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  MsgEvtOut: null
}>

export const init: Module['init'] = null

export const update: Module['update'] = async (_input) => {
  return {}
}

export const subscriptions: Module['subscriptions'] = async (_input) => {
  return Sub.None
}
