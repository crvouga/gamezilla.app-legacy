import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { Sub } from '~/@/sub'
import type { MsgCore, ModelCore, ModelBackend, MsgBackend, MsgToClient, MsgToBackend } from './vs-user.types'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'

//
//
//
//
//

type Module = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceBackendCtx
  Deps: null
  MsgCmdIn: null
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
  MsgEvtOut: null
}>

export const init: Module['init'] = null

export const update: Module['update'] = async (_input) => {
  return {}
}

export const subscriptions: Module['subscriptions'] = async (_input) => {
  return Sub.None
}
