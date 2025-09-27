import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { ProfileFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {}

export type MsgFrontend = { t: 'got-msg-out'; c: unknown }

export type MsgToBackend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: ProfileFrontendCtx
}>
