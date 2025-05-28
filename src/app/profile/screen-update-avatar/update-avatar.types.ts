import { RequestResponse } from '~/@/request-response/request-response'
import { ProfileAvatarSeed, ProfileAvatarStyle } from '~/app/@/data/profile-avatar'

export type ModelFrontend = {
  'profile.update-avatar.avatar-seed'?: ProfileAvatarSeed
  'profile.update-avatar.avatar-style'?: ProfileAvatarStyle
  'profile.update-avatar.request'?: RequestResponse<string, null>
}

export type ModelBackend = {}

export type MsgFrontend =
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

export type MsgBackend = {
  t: 'profile.update-avatar.noop'
}

export type MsgToBackend = {
  t: 'profile.update-avatar.clicked-save'
  avatarSeed: ProfileAvatarSeed
  avatarStyle: ProfileAvatarStyle
}

export type MsgToFrontend = {
  t: 'profile.update-avatar.updated-avatar'
  avatarSeed: ProfileAvatarSeed
  avatarStyle: ProfileAvatarStyle
}
