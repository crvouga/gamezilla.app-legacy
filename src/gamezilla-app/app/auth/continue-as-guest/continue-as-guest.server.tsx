import { Ok, Result, isErr, type Posix, type Task } from 'gamezilla-app/@/core'
import { UserId, type SessionId } from 'gamezilla-app/app/@/data'
import type { UserAccount } from 'gamezilla-app/app/@/data/account'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { ServerCtx, ServerModule } from '../auth.types'
import type { ModelServer } from './continue-as-guest.types'

const initModel: ModelServer = null

const continueAsGuest = async ({
  ctx,
  now,
  sessionId
}: {
  ctx: ServerCtx
  sessionId: SessionId
  now: Posix
}): Task<string, UserAccount> => {
  const existingGuestUserId = await ctx.guestSessionMappingDb.findUserIdBySessionId(sessionId)

  if (isErr(existingGuestUserId)) {
    return existingGuestUserId
  }

  const existingGuestAccount = Result.withDefault(
    await ctx.userAccountDb.findOneByUserId({
      userId: existingGuestUserId.value
    }),
    null
  )

  const newGuestAccount: UserAccount = {
    role: 'guest',
    userId: UserId.generate(),
    createdAt: now,
    phoneNumber: null
  }

  const guestAccount: UserAccount = existingGuestAccount ?? newGuestAccount

  await ctx.guestSessionMappingDb.insert({
    guestUserId: guestAccount.userId,
    sessionId: sessionId
  })

  const insertedAccount = existingGuestAccount
    ? Ok(null)
    : await ctx.userAccountDb.insert({
        account: guestAccount
      })

  if (isErr(insertedAccount)) {
    return insertedAccount
  }

  const insertedSession = await ctx.userSessionDb.insert({
    userId: guestAccount.userId,
    sessionId
  })

  if (isErr(insertedSession)) {
    return insertedSession
  }

  return Ok(guestAccount)
}

const update: ServerModule['update'] = async ({ msgClient, ctx }) => {
  switch (msgClient?.t) {
    case 'guest.clicked-continue-as-guest-button': {
      const result = await continueAsGuest({
        ctx,
        now: ctx.now,
        sessionId: msgClient.sessionId
      })

      if (isErr(result)) {
        return {
          msgCmd: [
            sendToClient(msgClient, {
              t: 'guest.continue-as-guest-result',
              result: result
            })
          ]
        }
      }

      return {
        msgCmd: [
          sendToClient(msgClient, {
            t: 'guest.continue-as-guest-result',
            result: Ok(result.value.userId)
          })
        ],
        msgEvt: [
          {
            t: 'auth/client-authenticated',
            clientId: msgClient.clientId,
            account: result.value,
            sessionId: msgClient.sessionId,
            loggedIn: true
          }
        ]
      }
    }

    default: {
      return {}
    }
  }
}

export const ContinueAsGuestServer = {
  initModel,
  update
}
