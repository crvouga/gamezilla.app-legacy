import { Posix, RequestResponse } from 'gamezilla-app/@/core'
import { Username } from 'gamezilla-app/app/@/data'

export type ModelClient = {
  'profile.update-username.username': string
  'profile-update-username.request'?: RequestResponse<string, null>
}

export type ModelServer = {}

export type MsgClient = { n: 'profile.update-username' } & (
  | {
      t: 'inputted-username'
      username: string
    }
  | {
      t: 'clicked-back'
    }
  | {
      t: 'clicked-save'
    }
)

export type MsgServer = { n: 'profile.update-username' } & {
  t: 'noop'
}

export type MsgToServer = { n: 'profile.update-username' } & {
  t: 'clicked-save'
  username: string
}

export type MsgToClient = { n: 'profile.update-username' } & {
  t: 'updated-username'
  username: Username
  lastUpdatedAt: Posix
}

const hasNamespace = (msg: unknown) =>
  typeof msg === 'object' && msg !== null && 'n' in msg && msg.n === 'profile.update-username'

export const isMsgServer = (msg: unknown): msg is MsgServer => hasNamespace(msg)
export const isMsgToServer = (msg: unknown): msg is MsgToServer => hasNamespace(msg)
export const isMsgToClient = (msg: unknown): msg is MsgToClient => hasNamespace(msg)
export const isMsgClient = (msg: unknown): msg is MsgClient => hasNamespace(msg)
