import { isErr, isOk } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { SessionId } from '~/app/@/data/session-id'
import type { UserId } from '~/app/@/data/user-id'
import { sendToFrontend } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { GuestSessionMappingDb } from './@/backend/guest-session-mapping-db'
import { UserAccountDb } from './@/backend/user-account-db'
import { UserSessionDb } from './@/backend/user-session-db'
import { ContinueAsGuestBackend } from './continue-as-guest/backend'
import { ContinueWithSmsBackend } from './continue-with-sms/backend'
import { LogoutBackend } from './logout/backend'
import { rpcContract, type BackendCtx, type BackendModule, type MsgToFrontend } from './types'

//
//
//
//
//

export const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  const authSMS = await ContinueWithSmsBackend.initCtx({ ctx: input.ctx })
  return {
    ...input.ctx,
    ...authSMS,
    userAccountDb: UserAccountDb({
      t: 'postgres',
      dbConnSql: input.ctx.dbConnSql,
    }),
    userSessionDb: await UserSessionDb({
      t: 'postgres-with-cache',
      dbConnSql: input.ctx.dbConnSql,
      keyValueDb: input.ctx.keyValueDb,
      logger: input.ctx.logger,
      pubSubTopicBased: input.ctx.pubSub,
    }),
    guestSessionMappingDb: GuestSessionMappingDb({
      t: 'postgres',
      dbConnSql: input.ctx.dbConnSql,
    }),
  }
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
  if (!sessionId) {
    return null
  }

  const found = await ctx.userSessionDb.findUserIdBySessionId(sessionId)

  if (isErr(found)) {
    return null
  }

  const userId = found.value

  return userId
}

const updateFromEvent: typeof update = async (input) => {
  switch (input.msgEvt?.t) {
    case 'wire-evt.frontend-connected': {
      const foundUserId = await input.ctx.userSessionDb.findUserIdBySessionId(input.msgEvt.sessionId)

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

      const inserted = await input.ctx.userSessionDb.insert({
        sessionId: input.msgEvt.sessionId,
        userId: input.msgEvt.user.userId,
      })

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
