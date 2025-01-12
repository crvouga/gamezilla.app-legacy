import { Sub } from '~/@/sub'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-server/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-server/evt'
import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import type { ModelCore, ModelBackend, MsgCore, MsgBackend, MsgToClient, MsgToBackend } from './connect-four.types'

//
//
//
//
//
//
//

type BackendModule = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
}>

//
//
//
// Model
//
//
//

const init: BackendModule['init'] = {
  t: null,
}

//
//
//
// Update
//
//
//

const update: BackendModule['update'] = async (_input) => {
  return {}
}

//
//
//
// Subscriptions
//
//
//

const subscriptions: BackendModule['subscriptions'] = async (_input) => {
  return Sub.None
}

export const ConnectFourBackend = {
  init,
  update,
  subscriptions,
}
