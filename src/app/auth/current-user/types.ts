import { p } from '~/@/parser'
import { RemoteResult } from '~/@/result'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { RPC } from '~/@/rpc'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../@/user-session/user-session'

export type ModelFrontend = {
  currentUser_currentUser: RemoteResult<string, UserAccount>
  currentUser_currentUserId: UserId | null
  currentUser_userSessions: UserSession[]
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
  | {
      t: 'got-user-sessions'
      userSessions: UserSession[]
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
  Ctx: AuthFrontendCtx & {
    rpc: RPC.Client<typeof rpcContract>
  }
  Model: ModelFrontend
  Msg: MsgFrontend
}>
