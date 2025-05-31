import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import type { SessionId } from '~/@/wire/session-id'
import type { UserId } from '~/app/@/data/user-id'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { BackendCtx } from './@/backend/ctx'
import { LoginWithSMSBackend } from './login-with-sms/backend'
import { CurrentUserBackend } from './current-user/backend'
import { rpcContract, type BackendModule } from './types'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<BackendCtx> => {
  return BackendCtx.init(input)
}

const update: BackendModule['update'] = async (_input) => {
  return {}
}

const getUserIdFromSessionId = async (ctx: BackendCtx, sessionId?: SessionId | null): Promise<UserId | null> => {
  if (!sessionId) return null

  const found = await ctx.userSessionDb.findUserIdBySessionId(sessionId)

  if (isErr(found)) {
    console.error(found.error)
    return null
  }

  return found.value
}

const subscriptions: BackendModule['subscriptions'] = async (_) => {
  return Sub.None
}

const rpc = (input: { ctx: BackendCtx }) => {
  return RPC.initServer(rpcContract, {
    sms: LoginWithSMSBackend.rpc({ ctx: input.ctx }),
    currentUser: CurrentUserBackend.rpc({ ctx: input.ctx }),
  })
}

export const AuthBackend = {
  initCtx,
  update,
  getUserIdFromSessionId,
  subscriptions,
  rpc,
}
