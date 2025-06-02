import { AppBackendCtxBase } from '../@/backend/ctx'
import { AuthBackendCtx } from './@/backend/ctx'
import { CurrentUserBackend } from './current-user/backend'
import { LoginWithSMSBackend } from './login-with-sms/backend'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<AuthBackendCtx> => {
  return AuthBackendCtx.init({ ctx: input.ctx })
}

const rpc = (input: { ctx: AuthBackendCtx }) => {
  return {
    ...LoginWithSMSBackend.rpc(input),
    ...CurrentUserBackend.rpc(input),
  }
}

const worker = async (_s: AbortSignal, _input: { ctx: AuthBackendCtx }) => {}

export const AuthBackend = {
  rpc,
  initCtx,
  worker,
}
