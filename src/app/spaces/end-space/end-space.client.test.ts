import { describe, expect, it } from 'bun:test'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { didPlaySound, didPushRoute } from '~/app/@/client/client-cmd'
import { SpaceId } from '~/app/@/data/space-id'
import { SpaceClientModule } from '../@/architecture/space-client'
import { clickedStartSpaceButton, Ctx, init, userClickedEndSpaceButton } from '../@/fixture/client'
import { EndSpaceClient } from './end-space.client'

describe(import.meta.file, () => {
  it('should redirect to space list after ending space if on space route', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      userClickedEndSpaceButton(
        {
          ...ctx,
          currentRoute: {
            n: 'spaces',
            t: 'space',
            spaceId
          }
        },
        spaceId
      )
    )

    expect(didPushRoute(updated)).toBe(true)
  })

  it('should not redirect to space list after ending space if not on space route', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const updated = await AppClientModule.andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId))

    const output = await AppClientModule.andThen(
      {
        model: updated.model
      },
      userClickedEndSpaceButton(
        {
          ...ctx,
          currentRoute: {
            n: 'spaces',
            t: 'space-list'
          }
        },
        spaceId
      )
    )

    expect(didPushRoute(output)).toBe(false)
  })

  it('should play sound after ending space', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      userClickedEndSpaceButton(ctx, spaceId)
    )
    expect(didPlaySound(updated)).toBe(true)
  })

  it('should end space when host logs out', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()
    const updated = await SpaceClientModule.andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId), (model) =>
      EndSpaceClient.update({
        model,
        ctx,
        msgEvt: {
          t: 'auth-evt.unauthenticated'
        }
      })
    )
    expect(
      updated.msgCore?.some(
        (spaceEvent) => spaceEvent.t === 'user-ended-space' && spaceEvent.userId === ctx.currentUserId
      )
    ).toBe(true)
  })
})
