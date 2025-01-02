import { describe, expect, it } from 'bun:test'
import { withEventMetaAt } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { didSendMsgToClient } from '~/app/@/server/cmd'
import { FixtureSpaceServer } from '../@/fixture/server'

const Fixture = async () => {
  const f = await FixtureSpaceServer()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it('should send a sync message to client that joined a space', async () => {
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
          ...f.clientB,
          t: 'got-msg-core',
          c: withEventMetaAt(1, {
            t: 'user-joined-space',
            spaceId,
            userId: f.clientB.userId
          })
        }
      }
    ])

    expect(didSendMsgToClient(output, (m) => m.t === 'synced')).toBe(true)
  })
})
