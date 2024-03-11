import { describe, expect, it } from "bun:test"
import { SpaceId } from "../../../@SHARED/data"
import { SpacesRoutes } from "../@SHARED/space.routes"
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

    const started = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    const output = await SpaceClientModule.andThen(
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
          SpacesRoutes.Space.is(msgCmd.c.route) &&
          msgCmd.c.route.payload.spaceId === currentUsersSpaceId,
      ),
    ).toBeTrue()
  })

  it("should play a sound when clicking current space bottom bar", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const started = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    const output = await SpaceClientModule.andThen(
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
