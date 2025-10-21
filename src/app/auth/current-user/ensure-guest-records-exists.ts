import { ILogger } from '~/@/logger'
import { Err, isErr, Ok, Result } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { IUserAccountDb } from '../@/user-account/user-account-db'
import { UserSession } from '../@/user-session/user-session'
import { IUserSessionDb } from '../@/user-session/user-session-db'
import { UserSessionId } from '../@/user-session/user-session-id'

export const ensureGuestRecords = async (input: {
  userSessionDb: IUserSessionDb
  userAccountDb: IUserAccountDb
  clientSessionId: ClientSessionId
  logger: ILogger
}): Promise<Result<string, null>> => {
  const logger = input.logger.child(['ensure-guest-records'])

  // Query existing sessions for this client
  const sessions = await input.userSessionDb.query({
    where: {
      op: 'and',
      clauses: [
        { op: '=', column: 'clientSessionId', value: input.clientSessionId },
        { op: '=', column: 'endedAt', value: null },
      ],
    },
  })

  if (isErr(sessions)) {
    logger.error('Failed to query sessions', { error: sessions.error })
    return Err(sessions.error.message)
  }

  // Find guest accounts linked to these sessions
  const guestAccounts = await input.userAccountDb.query({
    where: {
      op: 'and',
      clauses: [
        { op: '=', column: 'role', value: 'guest' },
        { op: 'in', column: 'userId', value: sessions.value.entities.items.map((s) => s.userId) },
      ],
    },
  })

  if (isErr(guestAccounts)) {
    logger.error('Failed to query guest accounts', { error: guestAccounts.error })
    return Err(guestAccounts.error.message)
  }

  const now = UnixMs.now()
  // Get or create guest account
  const existingGuestAccount = guestAccounts.value.entities.items.find((a) => a.role === 'guest')
  const guestAccount: UserAccount = existingGuestAccount ?? {
    role: 'guest',
    userId: UserId.generate(),
    createdAt: now,
    phoneNumber: null,
  }

  // Get or create guest session
  const existingGuestSession = sessions.value.entities.items.find((s) =>
    guestAccounts.value.entities.items.some((a) => a.userId === s.userId),
  )
  const guestSession: UserSession = existingGuestSession ?? {
    userSessionId: UserSessionId.generate(),
    sessionId: null,
    clientSessionId: input.clientSessionId,
    userId: guestAccount.userId,
    createdAt: now,
    endedAt: null,
  }

  // Persist records
  await input.userSessionDb.upsert({ entities: [guestSession] })
  await input.userAccountDb.upsert({ entities: [guestAccount] })

  logger.info('Guest records ensured', {
    isNewAccount: !existingGuestAccount,
    isNewSession: !existingGuestSession,
    userId: guestAccount.userId,
    sessionId: guestSession.userSessionId,
  })

  return Ok(null)
}
