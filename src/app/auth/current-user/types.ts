import { s } from '~/@/schema'
import { RemoteResult } from '~/@/result'
import { RPC } from '~/@/wire-rpc'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionId } from '../@/user-session/user-session-id'

export type ModelFrontend = {
  status: RemoteResult<string, null>
  userSessions: {
    [userSessionId: UserSessionId]: UserSession
  }
  userAccounts: {
    [userId: UserId]: UserAccount
  }
}

export type MsgFrontend =
  | {
      t: 'got-user-accounts'
      userAccounts: UserAccount[]
    }
  | {
      t: 'got-user-sessions'
      userSessions: UserSession[]
    }

export type MsgToBackend = { t: 'noop' }

export const rpcContract = RPC.initContract({
  getCurrentUser: {
    input: s.obj({}),
    output: s.obj({
      currentUser: s.maybe(UserAccount),
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
