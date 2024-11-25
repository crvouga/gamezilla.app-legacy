import { describe, expect, it } from 'bun:test'
import { FixtureSpaceServer } from '../@/fixture/server'
import { withEventMeta } from '@/event-sourced/event'
import { ClientId, SessionId, SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { unwrap } from '@/core'
import { SpaceCore } from '../core'
import { didSendMsgToClient } from 'gamezilla-app/app/@/server'

const Fixture = async () => {
  const f = await FixtureSpaceServer()
  return { ...f }
}
describe(import.meta.file, () => {
  it('should add a new space when receiving a user started space event', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const before = SpaceCore.toSpaceStarted(unwrap(await f.serverCtx.spacesCoreServer.get(spaceId)))

    await f.update([
      {
        msgClient: {
          t: 'got-msg-core',
          clientId: ClientId.generate(),
          sessionId: SessionId.generate(),
          c: withEventMeta({
            t: 'user-started-space',
            spaceId,
            userId: UserId.generate()
          })
        }
      }
    ])

    const after = SpaceCore.toSpaceStarted(unwrap(await f.serverCtx.spacesCoreServer.get(spaceId)))

    expect(before).toBeFalsy()
    expect(after?.spaceId).toEqual(spaceId)
  })

  it('should propagate the user started space event to the clients', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const output = await f.update([
      {
        msgClient: {
          t: 'got-msg-core',
          clientId: ClientId.generate(),
          sessionId: SessionId.generate(),
          c: withEventMeta({
            t: 'user-started-space',
            spaceId,
            userId: UserId.generate()
          })
        }
      }
    ])

    expect(
      didSendMsgToClient(
        output,
        (m) => m.t === 'got-msg-core' && m.c.t === 'user-started-space' && m.c.spaceId === spaceId
      )
    ).toBeTrue()
  })
})
