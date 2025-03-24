import { p } from '~/@/parser'
import { RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import { UserAccount } from '~/app/@/data/account'

export type ModelFrontend = {
  currentUser: RemoteResult<string, UserAccount>
}

export type MsgFrontend = { t: 'noop' }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export const rpcContract = RPC.initContract({
  getCurrentUser: {
    input: p.obj({}),
    output: p.obj({ currentUser: UserAccount }),
  },
})
