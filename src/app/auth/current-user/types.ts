import { RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import { s } from '~/@/schema'
import { UserAccount } from '~/app/@/data/user-account'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { isAnyMsg } from '~/@/msg/msg'

export type ModelFrontend = {
  currentUser_status: RemoteResult<string, null>
}

export type MsgFrontend = {
  t: 'currentUser_gotMsgOut'
  msgOut: unknown
}

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('currentUser_')
}

export const rpcContract = RPC.initContract({
  currentUser_getCurrentUser: {
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
