import { RPC } from '~/@/rpc'
import { s } from '~/@/schema'
import { UserAccount } from '~/app/@/data/user-account'

export const rpcContract = RPC.initContract({
  currentUser_getCurrentUser: {
    input: s.obj({}),
    output: s.obj({
      currentUser: s.maybe(UserAccount),
    }),
  },
})
