import { Task } from '~/@/promise/task'
import { Ok, Result, isErr } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { SessionId } from '~/@/wire/session-id'
import { sendToFrontend } from '~/app/@/backend/cmd'
import type { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'
import { BackendCtx } from '../@/backend/ctx'
import type { BackendModule } from '../types'

const update: BackendModule['update'] = async ({ msgFrontend, ctx }) => {
  switch (msgFrontend?.t) {
    case 'guest.clicked-continue-as-guest-button': {
      const result = await continueAsGuest({
        ctx,
        now: ctx.now,
        sessionId: msgFrontend.sessionId,
      })

      if (isErr(result)) {
        return {
          msgCmd: [
            sendToFrontend(msgFrontend, {
              t: 'guest.continue-as-guest-result',
              result: result,
            }),
          ],
        }
      }

      return {
        msgCmd: [
          sendToFrontend(msgFrontend, {
            t: 'guest.continue-as-guest-result',
            result: Ok(result.value.userId),
          }),
        ],
        msgEvt: [
          {
            t: 'auth-evt.client-authenticated',
            clientId: msgFrontend.clientId,
            user: result.value,
            sessionId: msgFrontend.sessionId,
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
  ctx: BackendCtx
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

export const ContinueAsGuestBackend = {
  update,
}
