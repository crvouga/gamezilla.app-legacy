import { describe, expect, it } from "bun:test"
import {
  didPlaySound,
  didPushRoute,
  didSendToServer,
  didShowToast,
} from "gamezilla-app/app/@SHARED/client"
import { SpaceId } from "gamezilla-app/app/@SHARED/data"
import { andThen } from "../../../@SHARED/architecture/app-client"
import { clickedStartSpaceButton, Ctx, init } from "../@SHARED/testing/client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should show toast when current user starts a space", () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const started = andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId))

    expect(didShowToast(started)).toBe(true)
  })

  it("should start a space for current user after clicking start button", () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const started = andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId))

    expect(Spaces.toSpaceIdByUserId(started.model, ctx.currentUserId)).toEqual(
      spaceId,
    )
  })

  it("should redirect after starting a space", () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const started = andThen(init(ctx), clickedStartSpaceButton(ctx, spaceId))

    expect(didPushRoute(started)).toBe(true)
  })

  it("should play sound after starting space", () => {
    const ctx = Ctx()
    const started = andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, SpaceId.generate()),
    )

    expect(didPlaySound(started)).toBe(true)
  })

  it("should send events to the server like user started space", () => {
    const ctx = Ctx()
    const output = andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, SpaceId.generate()),
    )

    expect(
      didSendToServer(
        output,
        (msg) =>
          msg.t === "event" &&
          msg.c.t === "user-started-space" &&
          msg.c.userId === ctx.currentUserId,
      ),
    ).toBe(true)
  })
})
