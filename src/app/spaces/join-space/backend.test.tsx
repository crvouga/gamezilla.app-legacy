import { describe, expect, it } from 'bun:test'
import { withEventMetaAt } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { didSendMsgToFrontend } from '~/app/@/backend/cmd'
import { FixtureSpaceBackend } from '../@/fixture/backend'

const Fixture = async () => {
  const f = await FixtureSpaceBackend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should send a sync message to frontend that joined a space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'sync.got-msg-space',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: f.frontendA.userId,
          }),
        },
      },
      {
        msgFrontend: {
          ...f.frontendB,
          t: 'sync.got-msg-space',
          c: withEventMetaAt(1, {
            t: 'user-joined-space',
            spaceId,
            userId: f.frontendB.userId,
          }),
        },
      },
    ])

    expect(didSendMsgToFrontend(output, (m) => m.t === 'sync.synced')).toBe(true)
  })
})
