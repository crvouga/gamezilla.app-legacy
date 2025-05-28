import { Msg } from '~/@/msg/msg'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { ProfileFrontendCmdBase } from '../@/frontend/cmd'
import { ProfileFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {}

export type MsgFrontend =
  | { t: 'clicked-back-button' }
  | { t: 'clicked-logout-button' }
  | { t: 'clicked-edit-profile-button' }
  | { t: 'got-msg-cmd'; c: ProfileFrontendCmdBase }

export type MsgToBackend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: ProfileFrontendCtx
  MsgCmdOut: Msg
}>
