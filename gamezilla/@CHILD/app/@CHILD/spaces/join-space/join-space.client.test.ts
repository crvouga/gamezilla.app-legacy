import { describe, expect, it } from "test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { didShowErrorSm } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  clickedJoinSpaceButton,
  clickedLeaveSpaceButton,
  createCtx,
  init,
  userStartedSpace,
} from "../@TEST/client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should join space when clicking join space button", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const joined = await AppClientModule.chainUpdates(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      clickedJoinSpaceButton(ctx, spaceId),
    )

    expect(Spaces.toSpaceIdByUserId(joined.model, ctx.currentUserId)).toEqual(
      spaceId,
    )
  })

  it("current user leaving joined space", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const left = await AppClientModule.chainUpdates(
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
    const ctx = createCtx()
    const SpaceA = SpaceId.generate()
    const SpaceB = SpaceId.generate()

    const arranged = await AppClientModule.chainUpdates(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), SpaceA),
      clickedJoinSpaceButton(ctx, SpaceA),
    )

    const joined = await AppClientModule.chainUpdates(
      { model: arranged.model },
      userStartedSpace(ctx, UserId.generate(), SpaceB),
      clickedJoinSpaceButton(ctx, SpaceB),
    )

    expect(Spaces.toSpaceIdByUserId(arranged.model, ctx.currentUserId)).toEqual(
      SpaceA,
    )

    expect(didShowErrorSm(joined)).toBeTrue()
  })
})
