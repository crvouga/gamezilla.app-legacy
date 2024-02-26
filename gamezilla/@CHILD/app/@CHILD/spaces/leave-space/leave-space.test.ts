import { describe, expect, test } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  clickedLeaveSpaceButton,
  createCtx,
  init,
  userJoinedSpace,
  userStartedSpace,
} from "../@TEST/client"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  test("user is not in space after leaving", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      userJoinedSpace(ctx, ctx.currentUserId, spaceId),
      clickedLeaveSpaceButton(ctx),
    )

    expect(Spaces.toSpaceIdByUserId(updated.model, ctx.currentUserId)).toEqual(
      null,
    )
  })

  test("should play sound after leaving", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const joined = await AppClientModule.chainUpdates(
      init(ctx),
      userStartedSpace(ctx, UserId.generate(), spaceId),
      userJoinedSpace(ctx, ctx.currentUserId, spaceId),
    )

    const left = await AppClientModule.chainUpdates(
      { model: joined.model },
      clickedLeaveSpaceButton(ctx),
    )

    expect(didPlaySound(left)).toBeTrue()
  })
})
