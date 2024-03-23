import { describe, expect, it } from "bun:test"
import {
  didPlaySound,
  didPushRoute,
  didSendToServer,
  didShowToast,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { andThen } from "../../../@SHARED/architecture/app-client"
import { clickedStartSpaceButton, createCtx, init } from "../@TEST/client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should show toast when current user starts a space", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const started = await andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    expect(didShowToast(started)).toBe(true)
  })

  it("should start a space for current user after clicking start button", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const started = await andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    expect(Spaces.toSpaceIdByUserId(started.model, ctx.currentUserId)).toEqual(
      spaceId,
    )
  })

  it("should redirect after starting a space", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const started = await andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    expect(didPushRoute(started)).toBe(true)
  })

  it("should play sound after starting space", async () => {
    const ctx = createCtx()
    const started = await andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, SpaceId.generate()),
    )

    expect(didPlaySound(started)).toBe(true)
  })

  it("should send events to the server like user started space", async () => {
    const ctx = createCtx()
    const output = await andThen(
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
