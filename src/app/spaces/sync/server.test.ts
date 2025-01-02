import { describe, expect, it } from 'bun:test'
import { withEventMetaAt } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { didBroadcast, didSendMsgToClient } from '~/app/@/server/cmd'
import { FixtureSpaceServer } from '../@/fixture/server'
import { UserAccount } from '~/app/@/data/account'
import { makeSpace } from '../@/fixture/shared'

const Fixture = async () => {
  const f = await FixtureSpaceServer()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it("should send user's space when they connect to the server", async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgClient: {
          ...f.clientA,
          t: 'got-msg-core',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: f.clientA.userId
          })
        }
      },
      {
        msgEvt: {
          ...f.clientA,
          t: 'auth-evt.client-authenticated',
          user: UserAccount.random({ userId: f.clientA.userId })
        }
      }
    ])

    expect(didSendMsgToClient(output, (m) => m.t === 'current-user-space')).toBe(true)
  })

  it('should send back synced response when client sends sync message', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgClient: {
          ...f.clientA,
          t: 'got-msg-core',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: f.clientA.userId
          })
        }
      },
      {
        msgClient: {
          ...f.clientA,
          t: 'sync',
          space: makeSpace({
            spaceId,
            hostId: f.clientA.userId
          })
        }
      }
    ])

    expect(didSendMsgToClient(output, (m) => m.t === 'synced')).toBe(true)
  })

  it('should broadcast space events received from clients to other clients', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgClient: {
          ...f.clientA,
          t: 'got-msg-core',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: f.clientA.userId
          })
        }
      }
    ])

    expect(didBroadcast(output, (m) => m.t === 'got-msg-core' && m.c.t === 'user-started-space')).toBe(true)
  })
})
