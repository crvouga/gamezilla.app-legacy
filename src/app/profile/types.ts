import { AppBackendModule } from '../@/architecture/app-backend'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { BackendCmd } from '../@/backend/cmd'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { BackendEvt } from '../@/backend/evt'
import { UserId } from '../@/data/user-id'
import { UserProfile } from '../@/data/user-profile'
import { ProfileBackendCtx } from './@/backend/ctx'
import { ProfileFrontendCtx } from './@/frontend/ctx'
import { ScreenProfileTypes } from './screen-profile'
import { ScreenUpdateUsernameTypes } from './screen-update-username'

export type BackendCtx = ProfileBackendCtx

export type FrontendCtx = ProfileFrontendCtx

export type ModelFrontend = {
  profilesByUserId: { [userId: UserId]: UserProfile }
  screenProfile: ScreenProfileTypes.ModelFrontend
  screenUpdateUsername: ScreenUpdateUsernameTypes.ModelFrontend
}

export type MsgFrontend =
  | { t: 'got-update-username-screen-msg'; c: ScreenUpdateUsernameTypes.MsgFrontend }
  | { t: 'got-profile-screen-msg'; c: ScreenProfileTypes.MsgFrontend }

export type MsgBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgToBackend = { t: 'got-profile-screen-msg'; c: ScreenProfileTypes.MsgToBackend }

export type BackendModule = AppBackendModule<{
  Ctx: AppBackendCtxBase
  MsgCmdIn: null
  MsgEvtIn: BackendEvt
  Model: null
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgEvtOut: null
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Deps: null
}>

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: ProfileFrontendCtx
}>
