import { Profile } from '~/app/@/data/profile'

export type ModelClient = {}

export type ModelBackend = {}

export type MsgClient =
  | {
      t: 'profile.profile-screen.clicked-edit'
    }
  | {
      t: 'profile.profile-screen.clicked-back'
    }
  | {
      t: 'profile.profile-screen.clicked-logout-button'
    }

export type MsgBackend = {
  t: 'profile.profile-screen.noop'
}

export type MsgToBackend = {
  t: 'profile.profile-screen.viewed-screen'
}

export type MsgToClient = {
  t: 'profile.profile-screen.profile'
  profile: Profile
}
