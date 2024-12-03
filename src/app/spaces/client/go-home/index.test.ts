import { describe, expect, it } from 'bun:test'
import { SpaceId } from '~/app/@/data'
import { SpaceClientModule } from '../../@/architecture/space-client'
import { clickedGoHomeButton, clickedStartSpaceButton, Ctx, init } from '../../@/fixture/client'

describe(import.meta.file, () => {
  it('should go to list screen when clicking go home button', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId)
      //
    )

    const output = await SpaceClientModule.andThen(
      {
        model: started.model
      },
      clickedGoHomeButton(ctx)
      //
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === 'routing' && msgCmd.c.t === 'push' && msgCmd.c.route.t === 'space-list'
      )
    ).toBe(true)
  })

  it('should play a sound when clicking go home button', async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const startedSpace = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId)
      //
    )
    const output = await SpaceClientModule.andThen(
      {
        model: startedSpace.model
      },
      clickedGoHomeButton(ctx)
      //
    )

    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'sound' && msgCmd.c.t === 'play')).toBe(true)
  })
})
