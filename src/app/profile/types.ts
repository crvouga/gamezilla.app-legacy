import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { UserId } from '../@/data/user-id'
import { UserProfile } from '../@/data/user-profile'
import { ProfileBackendCtx } from './@/backend/ctx'
import { ProfileFrontendCtx } from './@/frontend/ctx'
import { ScreenProfileTypes } from './screen-profile'
import { ScreenUpdateUsernameTypes } from './screen-update-username'

export type ModelFrontend = {
  profilesByUserId: { [userId: UserId]: UserProfile }
  screenProfile: ScreenProfileTypes.ModelFrontend
  screenUpdateUsername: ScreenUpdateUsernameTypes.ModelFrontend
}

export type MsgFrontend =
  | { t: 'got-update-username-screen-msg'; c: ScreenUpdateUsernameTypes.MsgFrontend }
  | { t: 'got-profile-screen-msg'; c: ScreenProfileTypes.MsgFrontend }

export type BackendCtxModule = ProfileBackendCtx

export type FrontendCtxModule = ProfileFrontendCtx

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: FrontendCtxModule
}>
