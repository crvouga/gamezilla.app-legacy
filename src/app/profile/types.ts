import { UserId } from '../@/data/user-id'
import { UserProfile } from '../@/data/user-profile'
import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { ProfileBackendCtx } from './@/backend/ctx'
import { ProfileFrontendCtx } from './@/frontend/ctx'
import { ScreenProfileFrontend } from './screen-profile'
import { ScreenUpdateUsernameFrontend } from './screen-update-username'

export type ModelFrontend = {
  profiles_profilesByUserId?: { [userId: UserId]: UserProfile }
  screenUpdateUsername: ScreenUpdateUsernameFrontend.Model
  screenProfile: ScreenProfileFrontend.ModelFrontend
}

export type MsgFrontend =
  | {
      t: 'screenUpdateUsername'
      c: ScreenUpdateUsernameFrontend.Msg
    }
  | {
      t: 'screenProfile'
      c: ScreenProfileFrontend.Msg
    }

export type BackendCtxModule = ProfileBackendCtx

export type FrontendCtxModule = ProfileFrontendCtx

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: FrontendCtxModule
}>
