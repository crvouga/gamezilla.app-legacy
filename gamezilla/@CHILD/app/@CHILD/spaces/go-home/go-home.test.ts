import { describe, expect, it } from "bun:test"
import { SpaceId } from "../../../@SHARED/data"
import {
  clickedGoHomeButton,
  clickedStartSpaceButton,
  init,
} from "../@TEST/client"
import { SpaceClientModule } from "../architechure/space-client"

describe("spaces go home", () => {
  it("should go to list screen when clicking go home button", async () => {
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.chainUpdates(
      init(),
      (model) => clickedStartSpaceButton(model, spaceId),
      //
    )

    const output = await SpaceClientModule.chainUpdates(
      { model: started.model },
      (model) => clickedGoHomeButton(model),
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
    const spaceId = SpaceId.generate()

    const startedSpace = await SpaceClientModule.chainUpdates(
      init(),
      (model) => clickedStartSpaceButton(model, spaceId),
      //
    )
    const output = await SpaceClientModule.chainUpdates(
      { model: startedSpace.model },
      (model) => clickedGoHomeButton(model),
      //
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "sound" && msgCmd.c.t === "play",
      ),
    ).toBeTrue()
  })
})
