import { ProfileCore } from '../profile.types'

export type ModelClient = {}

export type ModelServer = {}

export type MsgClient = {
  t: 'profile.current-user-profile.noop'
}

export type MsgServer = {
  t: 'profile.current-user-profile.noop'
}

export type MsgToServer = {
  t: 'profile.current-user-profile.noop'
}

export type MsgToClient = {
  t: 'profile.current-user-profile.profile'
  profile: ProfileCore
}
