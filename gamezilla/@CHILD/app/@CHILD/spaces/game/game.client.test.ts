import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import { eq } from "gamezilla/@SHARED/core"
import { exitGame } from "../@SHARED/space-client-cmd"
import {
  clickedGameTile,
  clickedGoHomeButton,
  clickedStartSpaceButton,
  ctx,
  init,
} from "../@TEST/client"
import { SpaceClientModule } from "../architechure/space-client"
import { Spaces } from "../spaces-core"
import * as SpacesClient from "../spaces.client"

describe("game client", () => {
  it("should play a sound after inputting a game", async () => {
    const spaceId = SpaceId.generate()
    const started = await AppClientModule.chainUpdates(await init(), (model) =>
      clickedStartSpaceButton(model, spaceId),
    )
    const output = await AppClientModule.chainUpdates(
      { model: started.model },
      (model) => clickedGameTile(model, "connect-four"),
    )
    expect(didPlaySound(output)).toBeTrue()
  })

  it("should be able to start game", async () => {
    const initial = await init()
    const spaceId = SpaceId.generate()

    const output = await SpaceClientModule.chainUpdates(
      { model: initial.model },
      //
      (model) => clickedStartSpaceButton(model, spaceId),
      (model) => clickedGameTile(model, "connect-four"),
    )

    const gameName = Spaces.toSpaceStarted(output.model, spaceId)?.game?.t
    expect(gameName).toBe("connect-four")
  })

  it("should exit game for corresponding cmd", async () => {
    const initial = await init()
    const spaceId = SpaceId.generate()

    const output = await SpaceClientModule.chainUpdates(
      { model: initial.model },
      //
      (model) => clickedStartSpaceButton(model, spaceId),
      (model) => clickedGameTile(model, "connect-four"),
      (model) => SpacesClient.updateMain({ model, ctx, msgCmd: exitGame() }),
    )

    const gameName =
      Spaces.toSpaceStarted(output.model, spaceId)?.game?.t ?? null

    expect(gameName).toBeNull()
  })

  it("should go to list screen when clicking go home button", async () => {
    const initial = await init()
    const spaceId = SpaceId.generate()

    const output = await SpaceClientModule.chainUpdates(
      { model: initial.model },
      //
      (model) => clickedStartSpaceButton(model, spaceId),
      (model) => clickedGoHomeButton(model),
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "routing" &&
          msgCmd.c.t === "push" &&
          eq(msgCmd.c.route, {
            t: "spaces",
            c: { t: "space-list" },
          }),
      ),
    ).toBeTrue()
  })
})
