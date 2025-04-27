import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { unwrap } from '~/@/result'
import { didSendMsgToFrontend } from '~/app/@/backend/cmd'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureSpaceBackend } from '../@/fixture/backend'
import { Space } from '../core/space'

const Fixture = async () => {
  const f = await FixtureSpaceBackend()
  return { ...f }
}
describe(import.meta.file, () => {
  it('should add a new space when receiving a user started space event', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const before = Space.toSpaceStarted(unwrap(await f.backendCtx.spacesCore.get(spaceId)))

    await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'sync.got-msg-space',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId,
            userId: UserId.generate(),
          }),
        },
      },
    ])

    const after = Space.toSpaceStarted(unwrap(await f.backendCtx.spacesCore.get(spaceId)))

    expect(before).toBeFalsy()
    expect(after?.spaceId).toEqual(spaceId)
  })

  it('should propagate the user started space event to the frontend', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const output = await f.update([
      {
        msgFrontend: {
          ...f.frontendA,
          t: 'sync.got-msg-space',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId,
            userId: UserId.generate(),
          }),
        },
      },
    ])

    expect(
      didSendMsgToFrontend(
        output,
        (m) => m.t === 'sync.got-msg-space' && m.c.t === 'user-started-space' && m.c.spaceId === spaceId,
      ),
    ).toBeTrue()
  })
})
