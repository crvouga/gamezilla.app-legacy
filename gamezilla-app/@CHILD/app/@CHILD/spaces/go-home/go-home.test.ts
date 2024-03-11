import { describe, expect, it } from "bun:test"
import { SpaceId } from "../../../@SHARED/data"
import { SpacesRoutes } from "../@SHARED/space.routes"
import {
  clickedGoHomeButton,
  clickedStartSpaceButton,
  createCtx,
  init,
} from "../@TEST/client"
import { SpaceClientModule } from "../architecture/architecture"

describe(import.meta.file, () => {
  it("should go to list screen when clicking go home button", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      //
    )

    const output = await SpaceClientModule.andThen(
      { model: started.model },
      clickedGoHomeButton(ctx),
      //
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "routing" &&
          msgCmd.c.t === "push" &&
          SpacesRoutes.SpaceList.is(msgCmd.c.route),
      ),
    ).toBeTrue()
  })

  it("should play a sound when clicking go home button", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const startedSpace = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      //
    )
    const output = await SpaceClientModule.andThen(
      { model: startedSpace.model },
      clickedGoHomeButton(ctx),
      //
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "sound" && msgCmd.c.t === "play",
      ),
    ).toBeTrue()
  })
})
