import { describe, expect, it } from 'bun:test'
import { SpaceId } from '../../../@/data'
import { clickedCurrentSpaceBottomBar, clickedStartSpaceButton, Ctx, init } from '../../@/fixture/client'
import { SpaceClientModule } from '../../architecture/space-client'
import * as SpacesCoreClient from '../../spaces-core/spaces-core.client'

describe(import.meta.file, () => {
  it('should open current space when clicking current space bottom bar', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId))

    const output = await SpaceClientModule.andThen(
      {
        model: started.model
      },
      clickedCurrentSpaceBottomBar(ctx)
    )
    const currentUsersSpaceId = SpacesCoreClient.toSpaceIdByUserId(output.model, ctx.currentUserId)

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === 'routing' &&
          msgCmd.c.t === 'push' &&
          msgCmd.c.route.t === 'space' &&
          msgCmd.c.route.spaceId === currentUsersSpaceId
      )
    ).toBe(true)
  })

  it('should play a sound when clicking current space bottom bar', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId))

    const output = await SpaceClientModule.andThen(
      {
        model: started.model
      },
      clickedCurrentSpaceBottomBar(ctx)
    )

    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'sound' && msgCmd.c.t === 'play')).toBe(true)
  })
})
