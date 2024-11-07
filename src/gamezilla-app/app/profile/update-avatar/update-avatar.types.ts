import { RequestResponse } from '@/core'
import { ProfileAvatarSeed, ProfileAvatarStyle } from 'gamezilla-app/app/@/data'

export type ModelClient = {
  'profile.update-avatar.avatar-seed'?: ProfileAvatarSeed
  'profile.update-avatar.avatar-style'?: ProfileAvatarStyle
  'profile.update-avatar.request'?: RequestResponse<string, null>
}

export type ModelServer = {}

export type MsgClient =
  | {
      t: 'profile.update-avatar.inputted-avatar-seed'
      avatarSeed: ProfileAvatarSeed
    }
  | {
      t: 'profile.update-avatar.inputted-avatar-style'
      avatarStyle: ProfileAvatarStyle
    }
  | {
      t: 'profile.update-avatar.clicked-back'
    }
  | {
      t: 'profile.update-avatar.clicked-save'
    }

export type MsgServer = {
  t: 'profile.update-avatar.noop'
}

export type MsgToServer = {
  t: 'profile.update-avatar.clicked-save'
  avatarSeed: ProfileAvatarSeed
  avatarStyle: ProfileAvatarStyle
}

export type MsgToClient = {
  t: 'profile.update-avatar.updated-avatar'
  avatarSeed: ProfileAvatarSeed
  avatarStyle: ProfileAvatarStyle
}
