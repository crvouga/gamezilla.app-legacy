import { isErr } from '~/@/result'
import { RPC } from '~/@/wire-rpc'
import { Sub } from '~/@/sub'
import type { SessionId } from '~/@/wire/session-id'
import type { UserId } from '~/app/@/data/user-id'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendCtx } from './@/backend/ctx'
import { LoginWithSMSBackend } from './login-with-sms/backend'
import { CurrentUserBackend } from './current-user/backend'
import { rpcContract, type BackendModule } from './types'

export const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  return BackendCtx.init(input)
}

export const update: BackendModule['update'] = async (_input) => {
  return {}
}

export const getUserIdFromSessionId = async (ctx: BackendCtx, sessionId?: SessionId | null): Promise<UserId | null> => {
  if (!sessionId) return null

  const found = await ctx.userSessionDb.findUserIdBySessionId(sessionId)

  if (isErr(found)) {
    console.error(found.error)
    return null
  }

  return found.value
}

export const subscriptions: BackendModule['subscriptions'] = async (_) => {
  return Sub.None
}

export const rpc = (input: { ctx: BackendCtx }) => {
  return RPC.initServer(rpcContract, {
    sms: LoginWithSMSBackend.rpc({ ctx: input.ctx }),
    currentUser: CurrentUserBackend.rpc({ ctx: input.ctx }),
  })
}
