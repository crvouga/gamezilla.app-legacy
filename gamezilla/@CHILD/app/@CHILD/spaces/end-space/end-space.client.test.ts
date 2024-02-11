import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { didPlaySound, didPushRoute } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  clickedStartSpaceButton,
  ctx,
  init,
  userClickedEndSpaceButton,
} from "../@TEST/client"
import { SpaceClientModule } from "../architechure/space-client"
import { EndSpaceClient } from "./end-space.client"

describe("end space client", () => {
  it("should redirect to space list after ending space if on space route", async () => {
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => clickedStartSpaceButton(model, spaceId),
      (model) =>
        userClickedEndSpaceButton(model, {
          ...ctx,
          currentRoute: { t: "spaces", c: { t: "space", spaceId } },
        }),
    )

    expect(
      didPushRoute(updated, { t: "spaces", c: { t: "space-list" } }),
    ).toBeTrue()
  })

  it("should not redirect to space list after ending space if not on space route", async () => {
    const spaceId = SpaceId.generate()

    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => clickedStartSpaceButton(model, spaceId),
      (model) =>
        userClickedEndSpaceButton(model, {
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
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => clickedStartSpaceButton(model, spaceId),
      (model) => userClickedEndSpaceButton(model),
    )
    expect(didPlaySound(updated)).toBeTrue()
  })

  it("should end space when host logs out", async () => {
    const spaceId = SpaceId.generate()
    const updated = await SpaceClientModule.chainUpdates(
      await init(),
      (model) => clickedStartSpaceButton(model, spaceId),
      (model) =>
        EndSpaceClient.update({ model, ctx, msgEvt: { t: "is-logged-out" } }),
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
