import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { didSendMsgToClient } from '~/app/@/server/cmd'
import { FixtureSpaceServer } from '../@/fixture/server'
import { SpaceCore } from '../core/space-core'

const Fixture = async () => {
  const f = await FixtureSpaceServer()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should list spaces when requested', async () => {
    const f = await Fixture()
    const output = await f.update([
      {
        msgClient: {
          ...f.clientA,
          t: 'list-spaces',
          limit: 10,
          offset: 0,
        },
      },
    ])
    expect(didSendMsgToClient(output, (msg) => msg.t === 'listed-spaces')).toBe(true)
  })
  it('should include the started space in the response', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgClient: {
          ...f.clientA,
          t: 'got-msg-core',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId,
            userId: f.clientA.userId,
          }),
        },
      },
      {
        msgClient: {
          ...f.clientB,
          t: 'list-spaces',
          limit: 10,
          offset: 0,
        },
      },
    ])
    expect(
      didSendMsgToClient(
        output,
        (msg) =>
          msg.t === 'listed-spaces' && msg.spaces.map(SpaceCore.toSpaceStarted).some((s) => s?.spaceId === spaceId),
      ),
    ).toBe(true)
  })
})
