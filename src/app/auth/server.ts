import { Sub, isErr, isOk } from '@/core'
import { AppServerModule } from 'app/@/architecture/app-server'
import type { SessionId, UserId } from 'app/@/data'
import { ServerCmd, AppServerCtx, sendToClient } from 'app/@/server'
import { UserAccountDb } from './@/server/user-account-db'
import { UserSessionDb } from './@/server/user-session-db'
import { AuthSMSServer } from './auth-sms/auth-sms.server'
import type { ServerCtx, MsgToClient, ServerModule } from './types'
import { ContinueAsGuestServer } from './continue-as-guest/server'
import { GuestSessionMappingDb } from './@/server/guest-session-mapping-db'
import { LogoutServer } from './logout/logout.server'

//
//
//
//
//

export const initCtx = async (input: { ctx: AppServerCtx }): Promise<ServerCtx> => {
  return {
    ...input.ctx,
    userAccountDb: UserAccountDb({
      t: 'postgres',
      dbConnSql: input.ctx.dbConnSql
    }),
    userSessionDb: await UserSessionDb({
      t: 'postgres-with-cache',
      dbConnSql: input.ctx.dbConnSql,
      dbConnKv: input.ctx.dbConnKv,
      logger: input.ctx.logger,
      pubSubTopicBased: input.ctx.pubSub
    }),
    guestSessionMappingDb: GuestSessionMappingDb({
      t: 'postgres',
      dbConnSql: input.ctx.dbConnSql
    })
  }
}

//
//
//
//
//
//
//

export const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen(
    {},
    () => updateFromEvent(input),
    () => updateChild(input),
    () => LogoutServer.update(input),
    () => ContinueAsGuestServer.update(input)
  )
}

export const getUserIdFromSessionId = async (ctx: ServerCtx, sessionId?: SessionId | null): Promise<UserId | null> => {
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

const updateChild: ServerModule['update'] = async (input) => {
  const sms = await AuthSMSServer.update({
    ...input,
    deps: await AuthSMSServer.initDeps(input),
    msgClient:
      input.msgClient?.t === 'sms'
        ? {
            ...input.msgClient,
            ...input.msgClient.c
          }
        : null,
    msg: input.msg?.t === 'sms' ? input.msg.c : null
  })

  return {
    msgCmd: ServerCmd.tag('sms', sms.msgCmd),
    msgEvt: sms.msgEvt
  }
}

const updateFromEvent: typeof update = async (input) => {
  switch (input.msgEvt?.t) {
    case 'wire/client-connected': {
      const foundUserId = await input.ctx.userSessionDb.findUserIdBySessionId(input.msgEvt.sessionId)

      const userId = isOk(foundUserId) ? foundUserId.value : null

      const foundAccount = await input.ctx.userAccountDb.findOneByUserId({
        userId
      })

      const account = isOk(foundAccount) ? foundAccount.value : null

      if (!account) {
        return {
          msgEvt: [
            {
              t: 'auth/client-unauthenticated',
              clientId: input.msgEvt.clientId,
              sessionId: input.msgEvt.sessionId
            }
          ]
        }
      }

      return {
        msgEvt: [
          {
            clientId: input.msgEvt.clientId,
            sessionId: input.msgEvt.sessionId,
            user: account,
            t: 'auth/client-authenticated'
          }
        ]
      }
    }

    case 'auth/client-unauthenticated': {
      return {
        msgCmd: [
          sendToClient([input.msgEvt.clientId], {
            t: 'client-unauthenticated'
          })
        ]
      }
    }

    case 'auth/client-authenticated': {
      const msgCmd = sendToClient<MsgToClient>([input.msgEvt.clientId], {
        t: 'client-authenticated',
        account: input.msgEvt.user,
        loggedIn: input.msgEvt.loggedIn ?? false
      })

      if (!input.msgEvt.loggedIn) {
        return {
          msgCmd: [msgCmd]
        }
      }

      const inserted = await input.ctx.userSessionDb.insert({
        sessionId: input.msgEvt.sessionId,
        userId: input.msgEvt.user.userId
      })

      if (isErr(inserted)) {
        return {}
      }

      return {
        msgCmd: [msgCmd]
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

export const subscriptions: ServerModule['subscriptions'] = async (input) => {
  return Sub.batch([
    Sub.tag(
      'sms',
      await AuthSMSServer.subscriptions({
        ...input,
        deps: await AuthSMSServer.initDeps(input)
      })
    )
  ])
}
