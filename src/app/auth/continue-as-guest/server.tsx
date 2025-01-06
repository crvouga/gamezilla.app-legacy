import { Task } from '~/@/promise/task'
import { Ok, Result, isErr } from '~/@/result'
import { Posix } from '~/@/time/posix'
import type { UserAccount } from '~/app/@/data/account'
import { SessionId } from '~/app/@/data/session-id'
import { UserId } from '~/app/@/data/user-id'
import { sendToClient } from '~/app/@/server/cmd'
import type { ServerCtx, ServerModule } from '../types'

const update: ServerModule['update'] = async ({ msgClient, ctx }) => {
  switch (msgClient?.t) {
    case 'guest.clicked-continue-as-guest-button': {
      const result = await continueAsGuest({
        ctx,
        now: ctx.now,
        sessionId: msgClient.sessionId,
      })

      if (isErr(result)) {
        return {
          msgCmd: [
            sendToClient(msgClient, {
              t: 'guest.continue-as-guest-result',
              result: result,
            }),
          ],
        }
      }

      return {
        msgCmd: [
          sendToClient(msgClient, {
            t: 'guest.continue-as-guest-result',
            result: Ok(result.value.userId),
          }),
        ],
        msgEvt: [
          {
            t: 'auth-evt.client-authenticated',
            clientId: msgClient.clientId,
            user: result.value,
            sessionId: msgClient.sessionId,
            loggedIn: true,
          },
        ],
      }
    }

    default: {
      return {}
    }
  }
}

const continueAsGuest = async ({
  ctx,
  now,
  sessionId,
}: {
  ctx: ServerCtx
  sessionId: SessionId
  now: Posix
}): Task<string, UserAccount> => {
  const existingGuestUserId = await ctx.guestSessionMappingDb.findUserIdBySessionId(sessionId)

  if (isErr(existingGuestUserId)) {
    return existingGuestUserId
  }

  const existingGuestAccount = Result.unwrapOr(
    await ctx.userAccountDb.findOneByUserId({
      userId: existingGuestUserId.value,
    }),
    null,
  )

  const newGuestAccount: UserAccount = {
    role: 'guest',
    userId: UserId.generate(),
    createdAt: now,
    phoneNumber: null,
  }

  const guestAccount: UserAccount = existingGuestAccount ?? newGuestAccount

  await ctx.guestSessionMappingDb.insert({
    guestUserId: guestAccount.userId,
    sessionId: sessionId,
  })

  const insertedAccount = existingGuestAccount
    ? Ok(null)
    : await ctx.userAccountDb.insert({
        account: guestAccount,
      })

  if (isErr(insertedAccount)) {
    return insertedAccount
  }

  const insertedSession = await ctx.userSessionDb.insert({
    userId: guestAccount.userId,
    sessionId,
  })

  if (isErr(insertedSession)) {
    return insertedSession
  }

  return Ok(guestAccount)
}

export const ContinueAsGuestServer = {
  update,
}
