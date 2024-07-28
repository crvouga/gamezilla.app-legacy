import { Profile } from 'gamezilla-app/app/@/data'

export type ModelClient = {}

export type ModelServer = {}

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

export type MsgServer = {
  t: 'profile.profile-screen.noop'
}

export type MsgToServer = {
  t: 'profile.profile-screen.viewed-screen'
}

export type MsgToClient = {
  t: 'profile.profile-screen.profile'
  profile: Profile
}
