import { describe, expect, it } from 'bun:test'
import { withEventMetaAt } from '~/@/event-sourced/event'
import { didPlaySound, didPushRoute, didShowToast } from '~/app/@/client/cmd'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureSpacesClient, userJoinedSpace, userLeftSpace, userStartedSpace } from '../@/fixture/client'
import { SpacesCoreClient } from '../core/client'

const Fixture = async () => {
  const f = await FixtureSpacesClient()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should navigate to list screen after leaving space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const output = f.update(f.initial, [
      userStartedSpace(0, f.userA.userId, spaceId),
      userJoinedSpace(1, f.ctx.currentUserId, spaceId),
      {
        msg: {
          t: 'clicked-leave-space-button',
          spaceId: spaceId,
        },
      },
    ])
    expect(didPushRoute(output, (x) => x.t === 'space-list')).toBe(true)
  })

  it('should only redirect to list screen for the user leaving the space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const userId = UserId.generate()

    const output = f.update(f.initial, [
      userStartedSpace(0, f.ctx.currentUserId, spaceId),
      userJoinedSpace(1, userId, spaceId),
      {
        msgBackend: {
          t: 'got-msg-core',
          c: withEventMetaAt(2, {
            t: 'user-left-space',
            spaceId,
            userId,
          }),
        },
      },
    ])

    expect(didPushRoute(output)).toBe(false)
  })

  it('should show some toast after leaving a space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      userStartedSpace(0, f.ctx.currentUserId, spaceId),
      userJoinedSpace(1, f.ctx.currentUserId, spaceId),
      userLeftSpace(2, f.ctx.currentUserId, spaceId),
    ])
    expect(didShowToast(output)).toBe(true)
  })

  it('user is not in space after leaving', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      userStartedSpace(0, f.ctx.currentUserId, spaceId),
      userJoinedSpace(1, f.ctx.currentUserId, spaceId),
      {
        msg: {
          t: 'clicked-leave-space-button',
          spaceId,
        },
      },
    ])
    const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(output.model, f.ctx.currentUserId)
    expect(currentUserSpaceId).toEqual(null)
  })

  it('should play sound after leaving', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      userStartedSpace(0, f.ctx.currentUserId, spaceId),
      userJoinedSpace(1, f.ctx.currentUserId, spaceId),
      {
        msg: {
          t: 'clicked-leave-space-button',
          spaceId,
        },
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
