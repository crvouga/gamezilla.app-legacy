import { describe, expect, it } from 'bun:test'
import { isOk } from 'gamezilla-app/@/core'
import { ClientId, SessionId } from 'gamezilla-app/app/@/data'
import { didSendMsgToClient } from 'gamezilla-app/app/@/server'
import { AppServerTestEnv, FixtureAppServer } from 'gamezilla-app/app/@/server/server-test-env'
import { UserAccountDb } from '../@/server/user-account-db'
import { UserSessionDb } from '../@/server/user-session-db'
import * as AuthServer from '../auth.server'
import type { ServerCtx } from '../auth.types'
import { ContinueAsGuestServer } from './server'
import type * as ContinueAsGuestTypes from './types'
import { GuestSessionMappingDb } from '../@/server/guest-session-mapping-db'

type Input =
  | {
      msgClient: ContinueAsGuestTypes.MsgToServer & {
        clientId: ClientId
        sessionId: SessionId
      }
    }
  | {
      msg: ContinueAsGuestTypes.MsgServer
    }

const BaseFixture = async (): Promise<{ ctx: ServerCtx }> => {
  const testEnv = await AppServerTestEnv()
  const f = await FixtureAppServer()

  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const userAccountDb = UserAccountDb({
        t: 'postgres',
        dbConnSql: testEnv.dbConnSql
      })
      const userSessionDb = await UserSessionDb({
        t: 'postgres-with-cache',
        dbConnSql: testEnv.dbConnSql,
        dbConnKv: testEnv.dbConnKv
      })
      const guestSessionMappingDb = GuestSessionMappingDb({
        t: 'postgres',
        dbConnSql: testEnv.dbConnSql
      })
      return {
        ctx: {
          ...f.ctx,
          userAccountDb,
          userSessionDb,
          guestSessionMappingDb
        }
      }
    }
    case 'unit': {
      const userAccountDb = UserAccountDb({
        t: 'in-memory',
        delay: async () => {}
      })
      const userSessionDb = await UserSessionDb({
        t: 'in-memory',
        delay: async () => {}
      })
      const guestSessionMappingDb = GuestSessionMappingDb({
        t: 'hash-map'
      })
      return {
        ctx: {
          ...f.ctx,
          userAccountDb,
          userSessionDb,
          guestSessionMappingDb
        }
      }
    }
  }
}

const Fixture = async () => {
  const f = await BaseFixture()

  const updates = async (msgs: Input[]) => {
    const updates: Awaited<ReturnType<typeof ContinueAsGuestServer.update>>[] = []
    for (const msg of msgs) {
      const update = await ContinueAsGuestServer.update({
        ...msg,
        deps: null,
        ctx: f.ctx
      })
      updates.push(update)
    }
    return updates
  }

  const update = async (msgs: Input[]) => {
    const updates_ = await updates(msgs)

    const update_ = updates_[updates_.length - 1]

    if (!update_) {
      throw new Error('No updates')
    }

    return update_
  }

  return {
    ...f,
    updates,
    update
  }
}

describe(import.meta.file, () => {
  it('should be able to handle request', async () => {
    const f = await Fixture()

    const clientId = ClientId.generate()

    const output = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId: SessionId.generate()
        }
      }
    ])
    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === 'wire' &&
          msgCmd.c.t === 'send-to-client' &&
          msgCmd.c.clientIds.includes(clientId) &&
          msgCmd.c.msg.t === 'guest.continue-as-guest-result'
      )
    ).toBe(true)
  })

  it('should output a client authenticated event', async () => {
    const f = await Fixture()

    const clientId = ClientId.generate()
    const sessionId = SessionId.generate()

    const output = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    expect(
      output.msgEvt?.some(
        (msgEvt) =>
          msgEvt.t === 'auth/client-authenticated' &&
          msgEvt.clientId === clientId &&
          msgEvt.sessionId === sessionId &&
          msgEvt.loggedIn
      )
    ).toBe(true)
  })

  it('should be able to find user id from session id after continuing as guest', async () => {
    const f = await Fixture()

    const clientId = ClientId.generate()
    const sessionId = SessionId.generate()

    await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const userId = await AuthServer.getUserIdFromSessionId(f.ctx, sessionId)

    expect(userId !== null).toBe(true)
  })

  it('should always use the same guest account for the same session id', async () => {
    const f = await Fixture()
    const sessionId = SessionId.generate()
    const clientId = ClientId.generate()

    const before = await AuthServer.getUserIdFromSessionId(f.ctx, sessionId)

    await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const afterFirst = await AuthServer.getUserIdFromSessionId(f.ctx, sessionId)

    await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const afterSecond = await AuthServer.getUserIdFromSessionId(f.ctx, sessionId)

    await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const afterThird = await AuthServer.getUserIdFromSessionId(f.ctx, sessionId)

    expect(before).toEqual(null)
    expect(afterFirst).toEqual(afterSecond)
    expect(afterSecond).toEqual(afterThird)
  })

  it('should send back ok result after continuing as a guest multiple times', async () => {
    const f = await Fixture()
    const sessionId = SessionId.generate()
    const clientId = ClientId.generate()

    const firstOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const secondOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    expect(
      didSendMsgToClient(firstOutput, (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result))
    ).toBe(true)
    expect(
      didSendMsgToClient(secondOutput, (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result))
    ).toBe(true)
  })

  it('should output the same account everytime', async () => {
    const f = await Fixture()
    const sessionId = SessionId.generate()
    const clientId = ClientId.generate()

    const firstOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const secondOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const expectedUserId = await AuthServer.getUserIdFromSessionId(f.ctx, sessionId)

    expect(
      didSendMsgToClient(
        firstOutput,
        (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result) && msg.result.value === expectedUserId
      )
    ).toBe(true)
    expect(
      didSendMsgToClient(
        secondOutput,
        (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result) && msg.result.value === expectedUserId
      )
    ).toBe(true)
  })

  it('should output the same account everytime', async () => {
    const f = await Fixture()
    const sessionId = SessionId.generate()
    const clientId = ClientId.generate()

    const firstOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const secondOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId
        }
      }
    ])

    const expectedUserId = await AuthServer.getUserIdFromSessionId(f.ctx, sessionId)

    expect(
      firstOutput.msgEvt?.some((msg) => msg.t === 'auth/client-authenticated' && msg.account.userId === expectedUserId)
    ).toBe(true)
    expect(
      secondOutput.msgEvt?.some((msg) => msg.t === 'auth/client-authenticated' && msg.account.userId === expectedUserId)
    ).toBe(true)
  })
})
