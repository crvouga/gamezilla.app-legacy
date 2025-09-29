import { RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import { s } from '~/@/schema'
import { UserAccount } from '~/app/@/data/user-account'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AuthFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {
  currentUser_status: RemoteResult<string, null>
}

export type MsgFrontend = {
  t: 'got-msg-out'
  msgOut: unknown
}

export type MsgToBackend = { t: 'noop' }

export const rpcContract = RPC.initContract({
  'auth/current-user/get-current-user': {
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
