import { describe, expect, it } from "bun:test"
import { SpaceId } from "../../../@SHARED/data"
import {
  clickedCurrentSpaceBottomBar,
  clickedStartSpaceButton,
  createCtx,
  init,
} from "../@TEST/client"
import { SpaceClientModule } from "../architecture/space-client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should open current space when clicking current space bottom bar", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    const output = await SpaceClientModule.chainUpdates(
      { model: started.model },
      clickedCurrentSpaceBottomBar(ctx),
    )
    const currentUsersSpaceId = Spaces.toSpaceIdByUserId(
      output.model,
      ctx.currentUserId,
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "routing" &&
          msgCmd.c.t === "push" &&
          msgCmd.c.route.t === "spaces" &&
          msgCmd.c.route.c.t === "space" &&
          msgCmd.c.route.c.spaceId === currentUsersSpaceId,
      ),
    ).toBeTrue()
  })

  it("should play a sound when clicking current space bottom bar", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    const output = await SpaceClientModule.chainUpdates(
      { model: started.model },
      clickedCurrentSpaceBottomBar(ctx),
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "sound" && msgCmd.c.t === "play",
      ),
    ).toBeTrue()
  })
})
