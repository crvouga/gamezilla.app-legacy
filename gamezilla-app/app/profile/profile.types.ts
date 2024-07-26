import {
  type ClientId,
  type Profile,
  ProfileAvatar,
  type ProfileAvatarSeed,
  type ProfileAvatarStyle,
  type UserId,
  type Username
} from 'gamezilla-app/app/@/data'
import type { RemoteResult, Result } from 'gamezilla-app/@/core'

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

export type ModelClient = {
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

export type MsgServer = { t: 'handled'; clientId: ClientId; msg: MsgToClient }

export type MsgToClient =
  | {
      t: 'current-user-profile'
      result: Result<string, Profile>
      source: unknown
      loggedIn?: boolean
    }
  | Res

export type MsgToServer = Req

export type Req =
  | { t: 'find-one'; userId: UserId }
  | { t: 'change-username'; username: string }
  | { t: 'search'; query: string }
  | { t: 'delete-forever'; query: string }

export type Res = Req & { result: Result<string, Profile[]> }
