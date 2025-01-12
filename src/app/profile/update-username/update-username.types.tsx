import { RequestResponse } from '~/@/request-response/request-response'
import { Posix } from '~/@/time/posix'
import { Username } from '~/app/@/data/username'

export type ModelFrontend = {
  'profile.update-username.username'?: string
  'profile-update-username.request'?: RequestResponse<string, null>
}

export type MsgFrontend =
  | {
      t: 'profile.update-username.inputted-username'
      username: string
    }
  | {
      t: 'profile.update-username.clicked-back'
    }
  | {
      t: 'profile.update-username.clicked-save'
    }

export type MsgBackend = {
  t: 'profile.update-username.noop'
}

export type MsgToBackend = {
  t: 'profile.update-username.clicked-save'
  username: string
}

export type MsgToFrontend = {
  t: 'profile.update-username.updated-username'
  username: Username
  lastUpdatedAt: Posix
}
