import { describe, expect, it } from "test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { didPlaySound, didPushRoute } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  clickedStartSpaceButton,
  createCtx,
  init,
  userClickedEndSpaceButton,
} from "../@TEST/client"
import { SpaceClientModule } from "../architecture/architecture"
import { EndSpaceClient } from "./end-space.client"

describe(import.meta.file, () => {
  it("should redirect to space list after ending space if on space route", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      userClickedEndSpaceButton({
        ...ctx,
        currentRoute: { t: "spaces", c: { t: "space", spaceId } },
      }),
    )

    expect(
      didPushRoute(updated, { t: "spaces", c: { t: "space-list" } }),
    ).toBeTrue()
  })

  it("should not redirect to space list after ending space if not on space route", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      userClickedEndSpaceButton({
        ...ctx,
        currentRoute: {
          t: "profile",
          c: { t: "profile", userId: UserId.generate() },
        },
      }),
    )

    expect(
      didPushRoute(updated, { t: "spaces", c: { t: "space-list" } }),
    ).toBeFalse()
  })

  it("should play sound after ending space", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      userClickedEndSpaceButton(ctx),
    )
    expect(didPlaySound(updated)).toBeTrue()
  })

  it("should end space when host logs out", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()
    const updated = await SpaceClientModule.chainUpdates(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      (model) =>
        EndSpaceClient.update({
          model,
          ctx,
          msgEvt: { t: "is-logged-out" },
        }),
    )
    expect(
      updated.msgSpaceEvent?.some(
        (spaceEvent) =>
          spaceEvent.t === "user-ended-space" &&
          spaceEvent.userId === ctx.currentUserId,
      ),
    ).toBeTrue()
  })
})
