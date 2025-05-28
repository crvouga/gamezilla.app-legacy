import { ClientId } from '../../@/wire/client-id'
import { AppBackendModule } from '../@/architecture/app-backend'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { BackendCmd } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendEvt } from '../@/backend/evt'
import { UserId } from '../@/data/user-id'
import { UserProfile } from '../@/data/user-profile'
import { AppFrontendCmd, ProfileCmd } from '../@/frontend/cmd'
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

export type MsgBackend =
  | { t: 'got-update-username-screen-msg'; c: ScreenUpdateUsernameTypes.MsgBackend }
  | { t: 'handled'; clientId: ClientId; msg: MsgToFrontend }

export type MsgToFrontend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type BackendModule = AppBackendModule<{
  Ctx: AppBackendCtx
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
  MsgCmdIn: ProfileCmd
  MsgCmdOut: AppFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>
}>
