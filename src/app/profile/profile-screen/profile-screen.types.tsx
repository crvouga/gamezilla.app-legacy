import { Profile } from '~/app/@/data/profile'

export type ModelFrontend = {}

export type ModelBackend = {}

export type MsgFrontend =
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

export type MsgToFrontend = {
  t: 'profile.profile-screen.profile'
  profile: Profile
}
