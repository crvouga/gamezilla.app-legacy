import { describe, expect, it } from 'bun:test'
import { withEventMetaAt } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { didBroadcast, didSendMsgToFrontend } from '~/app/@/backend/cmd'
import { FixtureSpaceBackend } from '../@/fixture/backend'
import { UserAccount } from '~/app/@/data/account'
import { makeSpace } from '../@/fixture/shared'

const Fixture = async () => {
  const f = await FixtureSpaceBackend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it("should send user's space when they connect to the backend", async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'got-msg-space',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: f.frontendA.userId,
          }),
        },
      },
      {
        msgEvt: {
          ...f.frontendA,
          t: 'auth-evt.client-authenticated',
          user: UserAccount.random({ userId: f.frontendA.userId }),
        },
      },
    ])

    expect(didSendMsgToFrontend(output, (m) => m.t === 'current-user-space')).toBe(true)
  })

  it('should send back synced response when frontend sends sync message', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'got-msg-space',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: f.frontendA.userId,
          }),
        },
      },
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'sync',
          space: makeSpace({
            spaceId,
            hostId: f.frontendA.userId,
          }),
        },
      },
    ])

    expect(didSendMsgToFrontend(output, (m) => m.t === 'synced')).toBe(true)
  })

  it('should broadcast space events received from frontends to other frontends', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'got-msg-space',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: f.frontendA.userId,
          }),
        },
      },
    ])

    expect(didBroadcast(output, (m) => m.t === 'got-msg-space' && m.c.t === 'user-started-space')).toBe(true)
  })
})
