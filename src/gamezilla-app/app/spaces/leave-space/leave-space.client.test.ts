import { describe, expect, it } from 'bun:test'
import { andThen } from 'gamezilla-app/app/@/architecture/app-client'
import { didPlaySound, didPushRoute, didShowToast } from 'gamezilla-app/app/@/client'
import { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import {
  Ctx,
  FixtureSpaceClient,
  clickedLeaveSpaceButton,
  init,
  userJoinedSpace,
  userLeftSpace,
  userStartedSpace
} from '../@/testing/client'
import * as SpacesCoreClient from '../spaces-core/spaces-core.client'
import { withEventMeta } from '../@/event'

const Fixture = async () => {
  const f = await FixtureSpaceClient()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it('should navigate to list screen after leaving space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const output = f.update(f.initial, [
      {
        msgServer: {
          t: 'event',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId: spaceId,
            userId: f.userA.userId
          })
        }
      },
      {
        msgServer: {
          t: 'event',
          c: withEventMeta({
            t: 'user-joined-space',
            spaceId: spaceId,
            userId: f.ctx.currentUserId
          })
        }
      },
      {
        msg: {
          t: 'clicked-leave-space-button'
        }
      }
    ])
    expect(didPushRoute(output, (x) => x.t === 'space-list')).toBe(true)
  })

  it('should only redirect to list screen for the user leaving the space', () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()
    const userId = UserId.generate()

    const joined = andThen(
      init(ctx),
      userStartedSpace(ctx, ctx.currentUserId, spaceId),
      userJoinedSpace(ctx, userId, spaceId)
    )

    const output = andThen(
      {
        model: joined.model
      },
      userLeftSpace(ctx, userId, spaceId)
    )

    expect(didPushRoute(output)).toBe(false)
  })

  it('should show some toast after leaving a space', () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const joined = andThen(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      userJoinedSpace(ctx, ctx.currentUserId, spaceId)
    )

    const output = andThen(
      {
        model: joined.model
      },
      userLeftSpace(ctx, ctx.currentUserId, spaceId)
    )

    expect(didShowToast(output)).toBe(true)
  })

  it('user is not in space after leaving', () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()
    const updated = andThen(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      userJoinedSpace(ctx, ctx.currentUserId, spaceId),
      clickedLeaveSpaceButton(ctx)
    )

    expect(SpacesCoreClient.toSpaceIdByUserId(updated.model, ctx.currentUserId)).toEqual(null)
  })

  it('should play sound after leaving', () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const joined = andThen(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      userJoinedSpace(ctx, ctx.currentUserId, spaceId)
    )

    const left = andThen(joined, clickedLeaveSpaceButton(ctx))

    expect(didPlaySound(left)).toBe(true)
  })
})
