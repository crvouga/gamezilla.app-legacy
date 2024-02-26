import { describe, expect, it } from "bun:test"
import { SpaceId } from "../../../@SHARED/data"
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

    const started = await SpaceClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      //
    )

    const output = await SpaceClientModule.chainUpdates(
      { model: started.model },
      clickedGoHomeButton(ctx),
      //
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "routing" &&
          msgCmd.c.t === "push" &&
          msgCmd.c.route.t === "spaces" &&
          msgCmd.c.route.c.t === "space-list",
      ),
    ).toBeTrue()
  })

  it("should play a sound when clicking go home button", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const startedSpace = await SpaceClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      //
    )
    const output = await SpaceClientModule.chainUpdates(
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
