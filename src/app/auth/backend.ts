import { RPC } from '~/@/rpc'
import { AuthBackendCtx } from './@/backend/ctx'
import { CurrentUserBackend } from './current-user/backend'
import { LoginWithSMSBackend } from './login-with-sms/backend'
import { rpcContract } from './types'
import { AppBackendCtxBase } from '../@/backend/ctx'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<AuthBackendCtx> => {
  return AuthBackendCtx.init({ ctx: input.ctx })
}

const rpc = (input: { ctx: AuthBackendCtx }) => {
  return RPC.initServer(rpcContract, {
    sms: LoginWithSMSBackend.rpc({ ctx: input.ctx }),
    currentUser: CurrentUserBackend.rpc({ ctx: input.ctx }),
  })
}

const saga = function* (_ctx: AuthBackendCtx) {}

export const AuthBackend = {
  rpc,
  initCtx,
  saga,
}
