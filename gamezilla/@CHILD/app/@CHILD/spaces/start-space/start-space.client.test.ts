import { describe, expect, it } from "bun:test"
import {
  didPlaySound,
  didPushRoute,
  didSendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import { AppClientModule } from "../../../@SHARED/architecture/app-client"
import { clickedStartSpaceButton, ctx, init } from "../@TEST/client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should start a space for current user after clicking start button", async () => {
    const spaceId = SpaceId.generate()

    const started = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => clickedStartSpaceButton(model, spaceId),
    )

    expect(Spaces.toSpaceIdByUserId(started.model, ctx.currentUserId)).toEqual(
      spaceId,
    )
  })

  it("should redirect after starting a space", async () => {
    const spaceId = SpaceId.generate()

    const started = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => clickedStartSpaceButton(model, spaceId),
    )

    expect(
      didPushRoute(started, { t: "spaces", c: { t: "space", spaceId } }),
    ).toBeTrue()
  })

  it("should play sound after starting space", async () => {
    const started = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => clickedStartSpaceButton(model, SpaceId.generate()),
    )

    expect(didPlaySound(started)).toBeTrue()
  })

  it("should send events to the server like user started space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => clickedStartSpaceButton(model, SpaceId.generate()),
    )

    expect(
      didSendToServer(
        output,
        (msg) =>
          msg.t === "event" &&
          msg.c.t === "user-started-space" &&
          msg.c.userId === ctx.currentUserId,
      ),
    ).toBeTrue()
  })
})
