import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { ProfileFrontendCmd, ProfileFrontendCmdInternal } from '../@/frontend/cmd'
import { ProfileFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {}

export type MsgFrontend =
  | { t: 'clicked-back-button' }
  | { t: 'clicked-logout-button' }
  | { t: 'clicked-edit-profile-button' }
  | { t: 'got-msg-out'; c: ProfileFrontendCmdInternal }

export type MsgToBackend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: ProfileFrontendCtx
  MsgCmdOut: ProfileFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
}>
