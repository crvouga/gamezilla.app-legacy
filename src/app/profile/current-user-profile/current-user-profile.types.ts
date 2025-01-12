import { ProfileCore } from '../types'

export type ModelClient = {}

export type ModelBackend = {}

export type MsgClient = {
  t: 'profile.current-user-profile.noop'
}

export type MsgBackend = {
  t: 'profile.current-user-profile.noop'
}

export type MsgToBackend = {
  t: 'profile.current-user-profile.noop'
}

export type MsgToClient = {
  t: 'profile.current-user-profile.profile'
  profile: ProfileCore
}
