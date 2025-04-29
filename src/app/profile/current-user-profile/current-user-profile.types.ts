import { UserProfile } from '~/app/@/data/user-profile'

export type ModelFrontend = {}

export type ModelBackend = {}

export type MsgFrontend = {
  t: 'profile.current-user-profile.noop'
}

export type MsgBackend = {
  t: 'profile.current-user-profile.noop'
}

export type MsgToBackend = {
  t: 'profile.current-user-profile.noop'
}

export type MsgToFrontend = {
  t: 'profile.current-user-profile.profile'
  profile: UserProfile
}
