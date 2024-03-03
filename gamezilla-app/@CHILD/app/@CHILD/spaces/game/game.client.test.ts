import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import { didPlaySound } from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { exitGame } from "../@SHARED/space-client-cmd"
import {
  clickedGameTile,
  clickedStartSpaceButton,
  createCtx,
  init,
} from "../@TEST/client"
import { SpaceClientModule } from "../architecture/architecture"
import { Spaces } from "../spaces-core"
import * as SpacesClient from "../spaces.client"

describe(import.meta.file, () => {
  it("should play a sound after inputting a game", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()
    const started = await AppClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )
    const output = await AppClientModule.andThen(
      { model: started.model },
      clickedGameTile(ctx, "connect-four"),
    )
    expect(didPlaySound(output)).toBeTrue()
  })

  it("should be able to start game", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const output = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      clickedGameTile(ctx, "connect-four"),
    )

    const gameName = Spaces.toSpaceStarted(output.model, spaceId)?.game?.t
    expect(gameName).toBe("connect-four")
  })

  it("should exit game for corresponding cmd", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const output = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      clickedGameTile(ctx, "connect-four"),
      (model) => SpacesClient.updateMain({ model, ctx, msgCmd: exitGame() }),
    )

    const gameName =
      Spaces.toSpaceStarted(output.model, spaceId)?.game?.t ?? null

    expect(gameName).toBeNull()
  })
})
