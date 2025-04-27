import { isErr, isOk } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import type { SessionId } from '~/@/wire/session-id'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { UserId } from '~/app/@/data/user-id'
import { sendToFrontend } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendCtx } from './@/backend/ctx'
import { ContinueAsGuestBackend } from './continue-as-guest/backend'
import { ContinueWithSmsBackend } from './continue-with-sms/backend'
import { LogoutBackend } from './logout/backend'
import { rpcContract, type BackendModule, type MsgToFrontend } from './types'
import { UserSession } from './@/user-session/user-session'
import { UserSessionId } from './@/user-session/user-session-id'
import { Posix } from '~/@/time/posix'

//
//
//
//
//

export const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  return BackendCtx.init(input)
}

//
//
//
//
//
//
//

export const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen(
    {},
    () => updateFromEvent(input),
    () => LogoutBackend.update(input),
    () => ContinueAsGuestBackend.update(input),
  )
}

export const getUserIdFromSessionId = async (ctx: BackendCtx, sessionId?: SessionId | null): Promise<UserId | null> => {
  if (!sessionId) return null

  const found = await ctx.userSessionDbCached.findUserIdBySessionId(sessionId)

  if (isErr(found)) {
    console.error(found.error)
    return null
  }

  return found.value
}

const updateFromEvent: typeof update = async (input) => {
  switch (input.msgEvt?.t) {
    case 'wire-evt.client-connected': {
      const foundUserId = await input.ctx.userSessionDbCached.findUserIdBySessionId(input.msgEvt.sessionId)

      const userId = isOk(foundUserId) ? foundUserId.value : null

      const foundAccount = await input.ctx.userAccountDb.findOneByUserId({
        userId,
      })

      const account = isOk(foundAccount) ? foundAccount.value : null

      if (!account) {
        return {
          msgEvt: [
            {
              t: 'auth-evt.client-unauthenticated',
              clientId: input.msgEvt.clientId,
              sessionId: input.msgEvt.sessionId,
            },
          ],
        }
      }

      return {
        msgEvt: [
          {
            clientId: input.msgEvt.clientId,
            sessionId: input.msgEvt.sessionId,
            clientSessionId: input.msgEvt.clientSessionId,
            user: account,
            t: 'auth-evt.client-authenticated',
          },
        ],
      }
    }

    case 'auth-evt.client-unauthenticated': {
      return {
        msgCmd: [
          sendToFrontend([input.msgEvt.clientId], {
            t: 'client-unauthenticated',
          }),
        ],
      }
    }

    case 'auth-evt.client-authenticated': {
      const msgCmd = sendToFrontend<MsgToFrontend>([input.msgEvt.clientId], {
        t: 'client-authenticated',
        account: input.msgEvt.user,
        loggedIn: input.msgEvt.loggedIn ?? false,
      })

      if (!input.msgEvt.loggedIn) {
        return {
          msgCmd: [msgCmd],
        }
      }

      const userSessionNew: UserSession = {
        userSessionId: UserSessionId.generate(),
        sessionId: input.msgEvt.sessionId,
        clientSessionId: input.msgEvt.clientSessionId,
        userId: input.msgEvt.user.userId,
        createdAt: Posix.now(),
        endedAt: null,
      }

      const inserted = await input.ctx.userSessionDb.insert(userSessionNew)

      if (isErr(inserted)) {
        return {}
      }

      return {
        msgCmd: [msgCmd],
      }
    }

    default: {
      return {}
    }
  }
}

//
//
//
//
//
//
//
//

export const subscriptions: BackendModule['subscriptions'] = async (_) => {
  return Sub.None
}

export const rpc = (input: { ctx: BackendCtx }) => {
  return RPC.initServer(rpcContract, {
    sms: ContinueWithSmsBackend.rpc({ ctx: input.ctx }),
  })
}
