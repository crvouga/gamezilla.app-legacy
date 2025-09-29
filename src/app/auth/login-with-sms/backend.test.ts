import { describe, expect, test } from '~/@/test-runner'
import { PhoneNumber } from '~/@/phone-number'
import { isErr, Ok, unwrap } from '~/@/result'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { FixtureAuthBackend } from '../@/backend/fixture'
import { LoginWithSMSBackend } from './backend'
import { UserAccount } from '~/app/@/data/user-account'
import { UserProfile } from '~/app/@/data/user-profile'

const Fixture = async () => {
  const f = await FixtureAuthBackend()
  return {
    ...f,
    preferredLanguage: 'en' as const,
    sessionId: SessionId.generate(),
    clientSessionId: ClientSessionId.generate(),
  }
}

describe('LoginWithSMSBackend', () => {
  test('should send code successfully', async () => {
    const f = await Fixture()
    const phoneNumber = PhoneNumber.random()
    const result = await LoginWithSMSBackend.sendCode({ ...f, phoneNumber })
    expect(result).toEqual(Ok({ phoneNumber }))
  })

  test('should create new account on successful verification', async () => {
    const f = await Fixture()
    const phoneNumber = PhoneNumber.random()

    const sent = await LoginWithSMSBackend.sendCode({ ...f, phoneNumber })
    if (isErr(sent)) throw new Error('Failed to send code')

    const before = unwrap(
      await f.ctx.userAccountDb.query({
        where: { op: '=', column: 'phoneNumber', value: phoneNumber },
        limit: 1,
        offset: 0,
      }),
    )
    const result = unwrap(await LoginWithSMSBackend.verifyCode({ ...f, phoneNumber, code: '123' }))
    const userAccountQuery = unwrap(
      await f.ctx.userAccountDb.query({
        where: {
          op: '=',
          column: 'phoneNumber',
          value: phoneNumber,
        },
        limit: 1,
        offset: 0,
      }),
    )

    if (!userAccountQuery.entities.items[0]) throw new Error('No account found')
    const userAccount = userAccountQuery.entities.items[0]
    const userSession =
      unwrap(
        await f.ctx.userSessionDb.query({
          where: { op: 'and', clauses: [{ op: '=', column: 'userId', value: userAccount.userId }] },
          orderBy: [{ column: 'createdAt', direction: 'desc' }],
          limit: 1,
          offset: 0,
        }),
      ).entities.items[0] ?? null
    if (!userSession) throw new Error('No session found')

    expect(before.entities.items).toEqual([])
    expect(result).toEqual({ userAccount, userSession })
    expect(userAccount.phoneNumber).toEqual(phoneNumber)
  })

  test('should use existing account on verification', async () => {
    const f = await Fixture()
    const userAccount = UserAccount.randomNormal()
    unwrap(await f.ctx.userAccountDb.upsert({ entities: [userAccount] }))
    unwrap(await LoginWithSMSBackend.sendCode({ ...f, phoneNumber: userAccount.phoneNumber }))
    const result = unwrap(
      await LoginWithSMSBackend.verifyCode({
        ...f,
        phoneNumber: userAccount.phoneNumber,
        code: '123',
      }),
    )
    expect(result.userAccount).toEqual(userAccount)
    const after = unwrap(
      await f.ctx.userAccountDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'phoneNumber', value: userAccount.phoneNumber }],
        },
        limit: 1,
        offset: 0,
      }),
    )
    expect(after.entities.items).toEqual([userAccount])
  })

  test.skip('should use existing profile on verification', async () => {
    const f = await Fixture()
    const userAccount = UserAccount.randomNormal()
    unwrap(await f.ctx.userAccountDb.upsert({ entities: [userAccount] }))
    const userProfile = await UserProfile.random({ userId: userAccount.userId })
    unwrap(await f.ctx.userProfileDb.put(userProfile))
    unwrap(await LoginWithSMSBackend.sendCode({ ...f, phoneNumber: userAccount.phoneNumber }))
    unwrap(
      await LoginWithSMSBackend.verifyCode({
        ...f,
        phoneNumber: userAccount.phoneNumber,
        code: '123',
      }),
    )
    const after = unwrap(
      await f.ctx.userProfileDb.query({
        whereAnd: { userId: { equals: userAccount.userId } },
        pagination: { limit: 1, offset: 0 },
        order: { createdAt: 'desc' },
      }),
    )
    expect(after.items).toEqual([userProfile])
  })
})
