import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { didSendMsgToFrontend } from '~/app/@/backend/cmd'
import { FixtureSpaceBackend } from '../@/fixture/backend'
import { Space } from '../core/space'

const Fixture = async () => {
  const f = await FixtureSpaceBackend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should list spaces when requested', async () => {
    const f = await Fixture()
    const output = await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'list-spaces',
          pagination: {
            offset: 0,
            limit: 10,
          },
        },
      },
    ])
    expect(didSendMsgToFrontend(output, (msg) => msg.t === 'listed-spaces')).toBe(true)
  })
  it('should include the started space in the response', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'got-msg-space',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId,
            userId: f.frontendA.userId,
          }),
        },
      },
      {
        msgFrontend: {
          ...f.frontendB,
          t: 'list-spaces',
          pagination: {
            limit: 10,
            offset: 0,
          },
        },
      },
    ])
    expect(
      didSendMsgToFrontend(
        output,
        (msg) => msg.t === 'listed-spaces' && msg.spaces.map(Space.toSpaceStarted).some((s) => s?.spaceId === spaceId),
      ),
    ).toBe(true)
  })
})
