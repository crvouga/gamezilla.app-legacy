import { describe, expect, it } from 'bun:test'
import { Ok, PhoneNumber, Result } from '~/@/core'
import type { ClientId, SessionId } from '~/app/@/data'
import { UserAccount } from '~/app/@/data/account'
import { didSendMsgToClient } from '~/app/@/server'
import { Logger } from '~/app/@/server/logger'
import { FixtureAppServer, randomClient } from '~/app/@/server/server-test-env'
import type { AuthSMSTypes } from '.'
import { UserAccountDb } from '../@/server/user-account-db'
import { AuthSMSServer } from './server'
import type { IVerifySMS } from './verify-sms/interface'
import { VerifySMS } from './verify-sms/impl/impl'

type InputMsg =
  | {
      msg: AuthSMSTypes.MsgServer
    }
  | {
      msgClient: AuthSMSTypes.MsgToServer & {
        clientId: ClientId
        sessionId: SessionId
      }
    }

const Fixture = async (input?: { VerifySMS?: IVerifySMS }) => {
  const f = await FixtureAppServer()
  const deps: Awaited<ReturnType<typeof AuthSMSServer.initDeps>> = {
    AccountDb: UserAccountDb({ t: 'in-memory', delay: async () => {} }),
    VerifySMS: input?.VerifySMS ?? VerifySMS({ t: 'fake-always-ok', logger: Logger({ t: 'noop' }) })
  }

  const updates = function* (msgs: InputMsg[]) {
    for (const msg of msgs) {
      yield AuthSMSServer.update({
        ctx: f.ctx,
        deps,
        ...msg
      })
    }
  }

  const update = (msgs: InputMsg[]) => {
    const updates_ = Array.from(updates(msgs))
    return updates_[updates_.length - 1] as (typeof updates_)[number]
  }

  const client = randomClient()

  return {
    ...f,
    ...deps,
    client,
    update
  }
}

describe(import.meta.file, () => {
  it('should send code when user clicks send code', async () => {
    const f = await Fixture()
    const updated = await f.update([
      {
        msgClient: {
          ...f.client,
          preferredLanguage: 'en',
          t: 'user-clicked-send-code-button',
          phoneNumber: PhoneNumber.random()
        }
      }
    ])
    expect(didSendMsgToClient(updated, (msg) => msg.t === 'sent-code')).toBe(true)
  })

  it('should verify code when user clicks verify code', async () => {
    const f = await Fixture()
    const updated = await f.update([
      {
        msgClient: {
          ...f.client,
          t: 'user-clicked-verify-code-button',
          phoneNumber: PhoneNumber.random(),
          inputtedCode: '123456'
        }
      }
    ])
    expect(didSendMsgToClient(updated, (msg) => msg.t === 'verified-code')).toBe(true)
  })

  it('should output event after successful verification', async () => {
    const f = await Fixture({
      VerifySMS: VerifySMS({
        t: 'fake-always-ok',
        logger: Logger({ t: 'noop' })
      })
    })

    const updated = await f.update([
      {
        msgClient: {
          ...f.client,
          t: 'user-clicked-verify-code-button',
          inputtedCode: '123',
          phoneNumber: PhoneNumber.random()
        }
      }
    ])

    expect(updated.msgEvt?.some((msgEvt) => msgEvt.t === 'auth/client-authenticated')).toBe(true)
  })

  it('should create a new account if no account exists', async () => {
    const phoneNumber = PhoneNumber.random()
    const f = await Fixture({
      VerifySMS: VerifySMS({
        t: 'fake-always-ok',
        phoneNumber,
        logger: Logger({ t: 'noop' })
      })
    })

    const before = Result.unwrap(
      await f.AccountDb.findOneByPhoneNumber({
        phoneNumber
      })
    )

    await f.update([
      {
        msgClient: {
          ...f.client,
          t: 'user-clicked-verify-code-button',
          inputtedCode: '123',
          phoneNumber
        }
      }
    ])

    const after = Result.unwrap(
      await f.AccountDb.findOneByPhoneNumber({
        phoneNumber
      })
    )

    expect(before).toBe(null)
    expect(after?.phoneNumber).toBe(phoneNumber)
  })

  it('should not create account if it already exists', async () => {
    const account = UserAccount.randomNormal()

    const f = await Fixture({
      VerifySMS: VerifySMS({
        t: 'fake-always-ok',
        phoneNumber: account.phoneNumber,
        logger: Logger({ t: 'noop' })
      })
    })

    await f.AccountDb.insert({
      account
    })

    await f.update([
      {
        msgClient: {
          ...f.client,
          t: 'user-clicked-verify-code-button',
          inputtedCode: '123',
          phoneNumber: PhoneNumber.random()
        }
      }
    ])

    const after = await f.AccountDb.findOneByPhoneNumber(account)
    expect(after).toEqual(Ok(account))
  })
})
