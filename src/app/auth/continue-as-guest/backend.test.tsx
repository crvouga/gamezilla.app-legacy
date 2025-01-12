import { describe, expect, it } from 'bun:test'
import { isOk } from '~/@/result'
import { SessionId } from '~/app/@/data/session-id'
import { ClientId } from '~/app/@/data/client-id'
import { AppBackendTestEnv, FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserAccountDb } from '../@/backend/user-account-db'
import { UserSessionDb } from '../@/backend/user-session-db'
import * as AuthBackend from '../backend'
import type { BackendCtx } from '../types'
import { ContinueAsGuestBackend } from './backend'
import type * as ContinueAsGuestTypes from './types'
import { GuestSessionMappingDb } from '../@/backend/guest-session-mapping-db'
import { didSendMsgToClient } from '~/app/@/backend/cmd'

type Input =
  | {
      msgClient: ContinueAsGuestTypes.MsgToBackend & {
        clientId: ClientId
        sessionId: SessionId
      }
    }
  | {
      msg: ContinueAsGuestTypes.MsgBackend
    }

const BaseFixture = async (): Promise<{ ctx: BackendCtx }> => {
  const testEnv = await AppBackendTestEnv()
  const f = await FixtureAppBackend()

  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const userAccountDb = UserAccountDb({
        t: 'postgres',
        dbConnSql: testEnv.dbConnSql,
      })
      const userSessionDb = await UserSessionDb({
        t: 'postgres-with-cache',
        dbConnSql: testEnv.dbConnSql,
        dbConnKv: testEnv.dbConnKv,
        logger: f.ctx.logger,
        pubSubTopicBased: f.ctx.pubSub,
      })
      const guestSessionMappingDb = GuestSessionMappingDb({
        t: 'postgres',
        dbConnSql: testEnv.dbConnSql,
      })
      return {
        ctx: {
          ...f.ctx,
          userAccountDb,
          userSessionDb,
          guestSessionMappingDb,
        },
      }
    }
    case 'unit': {
      const userAccountDb = UserAccountDb({
        t: 'in-memory',
        delay: async () => {},
      })
      const userSessionDb = await UserSessionDb({
        t: 'in-memory',
        simulateLatency: async () => {},
      })
      const guestSessionMappingDb = GuestSessionMappingDb({
        t: 'hash-map',
      })
      return {
        ctx: {
          ...f.ctx,
          userAccountDb,
          userSessionDb,
          guestSessionMappingDb,
        },
      }
    }
  }
}

const Fixture = async () => {
  const f = await BaseFixture()

  const updates = async (msgs: Input[]) => {
    const updates: Awaited<ReturnType<typeof ContinueAsGuestBackend.update>>[] = []
    for (const msg of msgs) {
      const update = await ContinueAsGuestBackend.update({
        ...msg,
        deps: null,
        ctx: f.ctx,
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
    update,
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
          sessionId: SessionId.generate(),
        },
      },
    ])
    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === 'wire' &&
          msgCmd.c.t === 'send-to-client' &&
          msgCmd.c.clientIds.includes(clientId) &&
          msgCmd.c.msg.t === 'guest.continue-as-guest-result',
      ),
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
          sessionId,
        },
      },
    ])

    expect(
      output.msgEvt?.some(
        (msgEvt) =>
          msgEvt.t === 'auth-evt.client-authenticated' &&
          msgEvt.clientId === clientId &&
          msgEvt.sessionId === sessionId &&
          msgEvt.loggedIn,
      ),
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
          sessionId,
        },
      },
    ])

    const userId = await AuthBackend.getUserIdFromSessionId(f.ctx, sessionId)

    expect(userId !== null).toBe(true)
  })

  it('should always use the same guest account for the same session id', async () => {
    const f = await Fixture()
    const sessionId = SessionId.generate()
    const clientId = ClientId.generate()

    const before = await AuthBackend.getUserIdFromSessionId(f.ctx, sessionId)

    await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId,
        },
      },
    ])

    const afterFirst = await AuthBackend.getUserIdFromSessionId(f.ctx, sessionId)

    await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId,
        },
      },
    ])

    const afterSecond = await AuthBackend.getUserIdFromSessionId(f.ctx, sessionId)

    await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId,
        },
      },
    ])

    const afterThird = await AuthBackend.getUserIdFromSessionId(f.ctx, sessionId)

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
          sessionId,
        },
      },
    ])

    const secondOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId,
        },
      },
    ])

    expect(
      didSendMsgToClient(firstOutput, (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result)),
    ).toBe(true)
    expect(
      didSendMsgToClient(secondOutput, (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result)),
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
          sessionId,
        },
      },
    ])

    const secondOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId,
        },
      },
    ])

    const expectedUserId = await AuthBackend.getUserIdFromSessionId(f.ctx, sessionId)

    expect(
      didSendMsgToClient(
        firstOutput,
        (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result) && msg.result.value === expectedUserId,
      ),
    ).toBe(true)
    expect(
      didSendMsgToClient(
        secondOutput,
        (msg) => msg.t === 'guest.continue-as-guest-result' && isOk(msg.result) && msg.result.value === expectedUserId,
      ),
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
          sessionId,
        },
      },
    ])

    const secondOutput = await f.update([
      {
        msgClient: {
          t: 'guest.clicked-continue-as-guest-button',
          clientId,
          sessionId,
        },
      },
    ])

    const expectedUserId = await AuthBackend.getUserIdFromSessionId(f.ctx, sessionId)

    expect(
      firstOutput.msgEvt?.some(
        (msg) => msg.t === 'auth-evt.client-authenticated' && msg.user.userId === expectedUserId,
      ),
    ).toBe(true)
    expect(
      secondOutput.msgEvt?.some(
        (msg) => msg.t === 'auth-evt.client-authenticated' && msg.user.userId === expectedUserId,
      ),
    ).toBe(true)
  })
})
