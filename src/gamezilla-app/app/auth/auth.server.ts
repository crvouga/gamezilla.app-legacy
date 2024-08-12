import { Sub, TimeSpan, isErr, isOk } from 'gamezilla-app/@/core'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import type { SessionId, UserId } from 'gamezilla-app/app/@/data'
import { ServerCmd, sendToClient } from 'gamezilla-app/app/@/server'
import { UserAccountDb } from './@/server/user-account-db'
import { UserSessionDb } from './@/server/user-session-db'
import { AuthSMSServer } from './auth-sms/auth-sms.server'
import type { MsgToClient, ServerDeps, ServerModule } from './auth.types'
import { ContinueAsGuestServer } from './continue-as-guest/continue-as-guest.server'
import { GuestSessionMappingDb } from './continue-as-guest/guest-session-mapping-db'
import { LogoutServer } from './logout/logout.server'

//
//
//
//
//

export const getDeps: ServerModule['getDeps'] = async ({ ctx }) => {
  return {
    userAccountDb: UserAccountDb({
      t: 'postgres',
      dbConnSql: ctx.dbConnSql
    }),
    userSessionDb: UserSessionDb({
      t: 'postgres-with-db-kv-cache',
      dbConnSql: ctx.dbConnSql,
      dbConnKv: ctx.dbConnKv
    }),
    guestSessionMappingDb: GuestSessionMappingDb({
      t: 'postgres',
      dbConnSql: ctx.dbConnSql
    }),
    timeout: (timeSpan) => new Promise((resolve) => setTimeout(resolve, TimeSpan.toMilliseconds(timeSpan)))
  }
}

export type Deps = Awaited<ReturnType<typeof getDeps>>

//
//
//
// Model
//
//
//

export const init: ServerModule['init'] = async (input) => {
  const sms = await AuthSMSServer.init(input)

  return {
    msgCmd: ServerCmd.tag('sms', sms.msgCmd),
    msgEvt: []
  }
}

//
//
//
// Update
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

export const toUserIdFromSessionId = async (deps: ServerDeps, sessionId: SessionId): Promise<UserId | null> => {
  const found = await deps.userSessionDb.findUserIdBySessionId(sessionId)

  if (isErr(found)) {
    return null
  }

  const userId = found.value

  return userId
}

const updateChild: ServerModule['update'] = async (input) => {
  const sms = await AuthSMSServer.update({
    ...input,
    deps: await AuthSMSServer.getDeps(input),
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

const updateFromEvent: typeof update = async ({ msgEvt, deps }) => {
  switch (msgEvt?.t) {
    case 'wire/client-connected': {
      const foundUserId = await deps.userSessionDb.findUserIdBySessionId(msgEvt.sessionId)

      const userId = isOk(foundUserId) ? foundUserId.value : null

      const foundAccount = await deps.userAccountDb.findOneByUserId({
        userId
      })

      const account = isOk(foundAccount) ? foundAccount.value : null

      if (!account) {
        return {
          msgEvt: [
            {
              t: 'auth/client-unauthenticated',
              clientId: msgEvt.clientId,
              sessionId: msgEvt.sessionId
            }
          ]
        }
      }

      return {
        msgEvt: [
          {
            clientId: msgEvt.clientId,
            sessionId: msgEvt.sessionId,
            account: account,
            t: 'auth/client-authenticated'
          }
        ]
      }
    }

    case 'auth/client-unauthenticated': {
      return {
        msgCmd: [
          sendToClient([msgEvt.clientId], {
            t: 'client-unauthenticated'
          })
        ]
      }
    }

    case 'auth/client-authenticated': {
      const msgCmd = sendToClient<MsgToClient>([msgEvt.clientId], {
        t: 'client-authenticated',
        account: msgEvt.account,
        loggedIn: msgEvt.loggedIn ?? false
      })

      if (!msgEvt.loggedIn) {
        return {
          msgCmd: [msgCmd]
        }
      }

      const inserted = await deps.userSessionDb.insert({
        sessionId: msgEvt.sessionId,
        userId: msgEvt.account.userId
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
        deps: await AuthSMSServer.getDeps(input)
      })
    )
  ])
}
