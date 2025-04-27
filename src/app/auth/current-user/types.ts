import { p } from '~/@/parser'
import { RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'

export type ModelFrontend = {
  currentUser: RemoteResult<string, UserAccount>
  currentUserId: UserId | null
}

export type MsgFrontend = { t: 'got-current-user-id'; currentUserId: UserId }

export const rpcContract = RPC.initContract({
  getCurrentUser: {
    input: p.obj({}),
    output: p.obj({ currentUser: p.maybe(UserAccount) }),
  },
})
