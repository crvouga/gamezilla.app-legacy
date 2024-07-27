import { Posix, RequestResponse } from 'gamezilla-app/@/core'
import { Username } from 'gamezilla-app/app/@/data'

export type ModelClient = {
  'profile.update-username.username'?: string
  'profile-update-username.request'?: RequestResponse<string, null>
}

export type MsgClient =
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

export type MsgServer = {
  t: 'profile.update-username.noop'
}

export type MsgToServer = {
  t: 'profile.update-username.clicked-save'
  username: string
}

export type MsgToClient = {
  t: 'profile.update-username.updated-username'
  username: Username
  lastUpdatedAt: Posix
}
