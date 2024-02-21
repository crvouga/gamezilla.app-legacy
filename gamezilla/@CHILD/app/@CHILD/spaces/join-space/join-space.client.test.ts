import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { didShowErrorSm } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  clickedJoinSpaceButton,
  clickedLeaveSpaceButton,
  ctx,
  init,
  userStartedSpace,
} from "../@TEST/client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should join space when clicking join space button", async () => {
    const spaceId = SpaceId.generate()

    const joined = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, UserId.generate(), spaceId),
      (model) => clickedJoinSpaceButton(model, spaceId),
    )

    expect(Spaces.toSpaceIdByUserId(joined.model, ctx.currentUserId)).toEqual(
      spaceId,
    )
  })

  it("current user leaving joined space", async () => {
    const spaceId = SpaceId.generate()

    const left = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, UserId.generate(), spaceId),
      (model) => clickedJoinSpaceButton(model, spaceId),
      (model) => clickedLeaveSpaceButton(model),
    )

    expect(Spaces.toSpaceIdByUserId(left.model, ctx.currentUserId)).toEqual(
      null,
    )
    //
  })

  it("preventing joining a space if already in a space", async () => {
    const SpaceA = SpaceId.generate()
    const SpaceB = SpaceId.generate()

    const arranged = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, UserId.generate(), SpaceA),
      (model) => clickedJoinSpaceButton(model, SpaceA),
    )

    const joined = await AppClientModule.chainUpdates(
      { model: arranged.model },
      (model) => userStartedSpace(model, UserId.generate(), SpaceB),
      (model) => clickedJoinSpaceButton(model, SpaceB),
    )

    expect(Spaces.toSpaceIdByUserId(arranged.model, ctx.currentUserId)).toEqual(
      SpaceA,
    )

    expect(didShowErrorSm(joined)).toBeTrue()
  })
})
