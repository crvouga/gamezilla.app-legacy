import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  didShowErrorSm,
  didShowToast,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import {
  clickedJoinSpaceButton,
  clickedLeaveSpaceButton,
  Ctx,
  createFixture,
  init,
  userJoinedSpace,
  userStartedSpace,
} from "../@SHARED/testing/client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should show some toast after joining space", async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const output = await andThen(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      clickedJoinSpaceButton(ctx, spaceId),
    )

    expect(
      didShowToast(output, (toast) =>
        toast.message.toLowerCase().includes("join"),
      ),
    ).toBe(true)
  })

  it("should should toast of other user leaving space", async () => {
    const f = createFixture()
    const spaceId = SpaceId.generate()

    const started = await andThen(
      f.initial,
      userStartedSpace(f.ctx, f.ctx.currentUserId, spaceId),
    )

    const output = await andThen(
      { model: started.model },
      userJoinedSpace(f.ctx, f.userA.userId, spaceId),
    )

    expect(didShowToast(output)).toBe(true)
  })

  it("should join space when clicking join space button", async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const joined = await andThen(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      clickedJoinSpaceButton(ctx, spaceId),
    )

    expect(Spaces.toSpaceIdByUserId(joined.model, ctx.currentUserId)).toEqual(
      spaceId,
    )
  })

  it("current user leaving joined space", async () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const left = await andThen(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      clickedJoinSpaceButton(ctx, spaceId),
      clickedLeaveSpaceButton(ctx),
    )

    expect(Spaces.toSpaceIdByUserId(left.model, ctx.currentUserId)).toEqual(
      null,
    )
    //
  })

  it("preventing joining a space if already in a space", async () => {
    const ctx = Ctx()
    const SpaceA = SpaceId.generate()
    const SpaceB = SpaceId.generate()

    const arranged = await andThen(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), SpaceA),
      clickedJoinSpaceButton(ctx, SpaceA),
    )

    const joined = await andThen(
      { model: arranged.model },
      userStartedSpace(ctx, UserId.generate(), SpaceB),
      clickedJoinSpaceButton(ctx, SpaceB),
    )

    expect(Spaces.toSpaceIdByUserId(arranged.model, ctx.currentUserId)).toEqual(
      SpaceA,
    )

    expect(didShowErrorSm(joined)).toBe(true)
  })
})
