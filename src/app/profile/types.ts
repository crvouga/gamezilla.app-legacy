import type { RemoteResult, Result } from '~/@/result'
import { AppServerModule } from '../@/architecture/app-server'
import { ClientId } from '../@/data/client-id'
import { Profile } from '../@/data/profile'
import { ProfileAvatar, ProfileAvatarSeed, ProfileAvatarStyle } from '../@/data/profile-avatar'
import { UserId } from '../@/data/user-id'
import { Username } from '../@/data/username'
import { AppServerCtx, ServerCmd, ServerEvt } from '../@/server'
import * as UpdateUsernameTypes from './update-username/update-username.types'
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
      style: profile.avatarStyle ?? ProfileAvatar.STYLES['big-ears-neutral']
    }),
    userId: profile.userId,
    username: profile.username
  }
}

export type ModelClient = UpdateUsernameTypes.ModelClient & {
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

export type MsgClient =
  | Req
  | UpdateUsernameTypes.MsgClient
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

export type MsgServer = UpdateUsernameTypes.MsgServer | { t: 'handled'; clientId: ClientId; msg: MsgToClient }

export type MsgToClient =
  | UpdateUsernameTypes.MsgToClient
  | {
      t: 'current-user-profile'
      result: Result<string, Profile>
      causedBy: unknown
      loggedIn?: boolean
    }
  | Res

export type MsgToServer = Req | UpdateUsernameTypes.MsgToServer

export type Req =
  | { t: 'find-one'; userId: UserId }
  | { t: 'change-username'; username: string }
  | { t: 'search'; query: string }
  | { t: 'delete-forever'; query: string }

export type Res = Req & { result: Result<string, Profile[]> }

export type ServerCtx = AppServerCtx

export type ServerModule = AppServerModule<{
  Ctx: ServerCtx
  MsgCmdIn: null
  MsgEvtIn: ServerEvt
  Model: null
  Msg: MsgServer
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: null
}>
