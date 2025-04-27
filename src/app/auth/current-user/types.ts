import { p } from '~/@/parser'
import { RemoteResult } from '~/@/result'
import { FrontendCtx } from '../@/frontend/ctx'
import { RPC } from '~/@/rpc'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'

export type ModelFrontend = {
  currentUser: RemoteResult<string, UserAccount>
  currentUserId: UserId | null
}

export type MsgFrontend =
  | {
      t: 'got-current-user-id'
      currentUserId: UserId
    }
  | {
      t: 'got-current-user-account'
      currentUserAccount: UserAccount | null
    }

export const rpcContract = RPC.initContract({
  getCurrentUser: {
    input: p.obj({}),
    output: p.obj({
      currentUser: p.maybe(UserAccount),
    }),
  },
})

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtx & {
    rpcClient: RPC.Client<typeof rpcContract>
  }
  Model: ModelFrontend
  Msg: MsgFrontend
}>
