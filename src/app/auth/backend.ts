import { AppBackendCtxBase } from '../@/backend/ctx'
import { AuthBackendCtx } from './@/backend/ctx'
import { CurrentUserBackend } from './current-user/backend'
import { LoginWithSMSBackend } from './login-with-sms/backend'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<AuthBackendCtx> => {
  return AuthBackendCtx.init({ ctx: input.ctx })
}

const rpc = (input: { ctx: AuthBackendCtx }) => {
  return {
    ...LoginWithSMSBackend.rpc({ ctx: input.ctx }),
    ...CurrentUserBackend.rpc({ ctx: input.ctx }),
  }
}

const saga = function* (_ctx: AuthBackendCtx) {}

export const AuthBackend = {
  rpc,
  initCtx,
  saga,
}
