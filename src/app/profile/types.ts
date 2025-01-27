import type { RemoteResult, Result } from '~/@/result'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { AppBackendModule } from '../@/architecture/app-backend'
import { AppFrontendCmd, ProfileCmd } from '../@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '../@/frontend/ctx'
import { FrontendEvt } from '../@/frontend/evt'
import { ClientId } from '../@/data/client-id'
import { Profile } from '../@/data/profile'
import { ProfileAvatar, ProfileAvatarSeed, ProfileAvatarStyle } from '../@/data/profile-avatar'
import { UserId } from '../@/data/user-id'
import { Username } from '../@/data/username'
import { BackendCmd } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendEvt } from '../@/backend/evt'
import * as UpdateUsernameTypes from './update-username/update-username.types'
import { ScreenActionsProps } from '../@/screen/screen-layout'
//
//
//
// Model
//
//
//

export type ProfileCore = {
  userId: UserId
  username: Username
  avatarSeed: ProfileAvatarSeed | null
  avatarStyle: ProfileAvatarStyle | null
}

export const profileCoreToProfile = (profile: ProfileCore): Profile => {
  return {
    avatarUrl: ProfileAvatar.toUrl({
      seed: profile.avatarSeed ?? profile.username,
      style: profile.avatarStyle ?? ProfileAvatar.STYLES['big-ears-neutral'],
    }),
    userId: profile.userId,
    username: profile.username,
  }
}

export type ModelFrontend = UpdateUsernameTypes.ModelFrontend & {
  profiles: {
    [userId: UserId]: Profile
  }
  requests: {
    [key in Req['t']]?: RemoteResult<string, null>
  }
  draft?: {
    username?: string
    avatarSeed?: ProfileAvatarSeed
    avatarStyle?: ProfileAvatarStyle
  }
}

//
//
//
// Msg
//
//
//

export type MsgFrontend =
  | Req
  | UpdateUsernameTypes.MsgFrontend
  | {
      t: 'clicked-back-button'
      from:
        | {
            t: 'profile'
            userId: UserId
          }
        | {
            t: 'profile-avatar'
          }
        | {
            t: 'profile-update'
          }
        | {
            t: 'profile-update-username'
          }
    }
  | { t: 'inputted-username'; username: string }
  | { t: 'inputted-avatar-seed'; seed: string }
  | {
      t: 'inputted-avatar-style'
      style: ProfileAvatarStyle
    }
  | { t: 'clicked-generate-random-seed' }
  | { t: 'clicked-logout-button' }
  | { t: 'clicked-edit-profile-button' }
  | { t: 'clicked-change-avatar-button' }
  | { t: 'clicked-avatar' }
  | { t: 'clicked-update-username-button' }

export type MsgBackend = UpdateUsernameTypes.MsgBackend | { t: 'handled'; clientId: ClientId; msg: MsgToFrontend }

export type MsgToFrontend =
  | UpdateUsernameTypes.MsgToFrontend
  | {
      t: 'current-user-profile'
      result: Result<string, Profile>
      causedBy: unknown
      loggedIn?: boolean
    }
  | Res

export type MsgToBackend = Req | UpdateUsernameTypes.MsgToBackend

export type Req =
  | { t: 'find-one'; userId: UserId }
  | { t: 'change-username'; username: string }
  | { t: 'search'; query: string }
  | { t: 'delete-forever'; query: string }

export type Res = Req & { result: Result<string, Profile[]> }

export type BackendCtx = AppBackendCtx

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
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

export type FrontendCtx = (AppFrontendCtx | AnonymousFrontendCtx) & {
  parentScreenActions?: ScreenActionsProps | null
}

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FrontendCtx
  MsgCmdIn: ProfileCmd
  MsgEvtIn: FrontendEvt
  MsgCmdOut: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
  MsgEvtOut: FrontendEvt
}>
