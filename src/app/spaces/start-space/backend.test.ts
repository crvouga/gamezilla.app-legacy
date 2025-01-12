import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { unwrap } from '~/@/result'
import { ClientId } from '~/app/@/data/client-id'
import { SessionId } from '~/app/@/data/session-id'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { didSendMsgToFrontend } from '~/app/@/backend/cmd'
import { FixtureSpaceBackend } from '../@/fixture/backend'
import { SpaceSpace } from '../space/space'

const Fixture = async () => {
  const f = await FixtureSpaceBackend()
  return { ...f }
}
describe(import.meta.file, () => {
  it('should add a new space when receiving a user started space event', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const before = SpaceSpace.toSpaceStarted(unwrap(await f.backendCtx.spaceBackend.get(spaceId)))

    await f.update([
      {
        msgFrontend: {
          t: 'got-msg-space',
          clientId: ClientId.generate(),
          sessionId: SessionId.generate(),
          c: withEventMeta({
            t: 'user-started-space',
            spaceId,
            userId: UserId.generate(),
          }),
        },
      },
    ])

    const after = SpaceSpace.toSpaceStarted(unwrap(await f.backendCtx.spaceBackend.get(spaceId)))

    expect(before).toBeFalsy()
    expect(after?.spaceId).toEqual(spaceId)
  })

  it('should propagate the user started space event to the frontends', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const output = await f.update([
      {
        msgFrontend: {
          t: 'got-msg-space',
          clientId: ClientId.generate(),
          sessionId: SessionId.generate(),
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
        (m) => m.t === 'got-msg-space' && m.c.t === 'user-started-space' && m.c.spaceId === spaceId,
      ),
    ).toBeTrue()
  })
})
