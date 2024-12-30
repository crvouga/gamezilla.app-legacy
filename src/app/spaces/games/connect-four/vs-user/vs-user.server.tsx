import type { GameServerModule } from '~/app/spaces/games/@/architecture/game-server-v2'
import type { SpaceServerCmd } from '~/app/spaces/@/space-server-cmd'
import { Sub } from '~/@/sub'
import type { MsgCore, ModelCore, ModelServer, MsgServer, MsgToClient, MsgToServer } from './vs-user.types'
import { SpaceServerCtx } from '~/app/spaces/@/space-server-ctx'
import { SpaceServerEvt } from '~/app/spaces/@/space-server-evt'

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
