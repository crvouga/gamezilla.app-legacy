import { Sub } from '~/@/sub'
import type { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { ModelSpace, ModelBackend, MsgSpace, MsgBackend, MsgToFrontend, MsgToBackend } from './connect-four.types'

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
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: SpaceBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
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
