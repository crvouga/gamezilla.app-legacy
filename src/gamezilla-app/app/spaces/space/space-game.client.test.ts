import { describe, expect, it } from 'bun:test'
import { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import { didPlaySound } from 'gamezilla-app/app/@/client'
import { SpaceId } from 'gamezilla-app/app/@/data'
import { exitGame } from '../@/space-client-cmd'
import { Ctx, clickedGameTile, clickedStartSpaceButton, init } from '../@/testing/client'
import { SpaceClientModule } from '../architecture/space-client'
import * as SpacesCoreClient from '../spaces-core/spaces-core.client'
import * as SpacesClient from '../spaces.client'

describe(import.meta.file, () => {
  it('should play a sound after inputting a game', () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()
    const started = AppClientModule.andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId))
    const output = AppClientModule.andThen(
      {
        model: started.model
      },
      clickedGameTile(ctx, 'connect-four')
    )
    expect(didPlaySound(output)).toBe(true)
  })

  it('should be able to start game', () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const output = SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      clickedGameTile(ctx, 'connect-four')
    )

    const gameName = SpacesCoreClient.toSpaceStarted(output.model, spaceId)?.game?.t
    expect(gameName).toBe('connect-four')
  })

  it('should exit game for corresponding cmd', () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const output = SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      clickedGameTile(ctx, 'connect-four'),
      (model) =>
        SpacesClient.updateLoop({
          model,
          ctx,
          msgCmd: exitGame()
        })
    )

    const gameName = SpacesCoreClient.toSpaceStarted(output.model, spaceId)?.game?.t ?? null

    expect(gameName).toBeNull()
  })
})
