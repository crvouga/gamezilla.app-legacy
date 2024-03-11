import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  didPlaySound,
  didPushRoute,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
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
    const updated = await AppClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      userClickedEndSpaceButton({
        ...ctx,
        currentRoute: { n: "spaces", t: "space", spaceId },
      }),
    )

    expect(didPushRoute(updated)).toBeTrue()
  })

  it("should not redirect to space list after ending space if not on space route", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()

    const updated = await AppClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
    )

    const output = await AppClientModule.andThen(
      { model: updated.model },
      userClickedEndSpaceButton({
        ...ctx,
        currentRoute: { n: "spaces", t: "space-list" },
      }),
    )

    expect(didPushRoute(output)).toBeFalse()
  })

  it("should play sound after ending space", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()
    const updated = await AppClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      userClickedEndSpaceButton(ctx),
    )
    expect(didPlaySound(updated)).toBeTrue()
  })

  it("should end space when host logs out", async () => {
    const ctx = createCtx()
    const spaceId = SpaceId.generate()
    const updated = await SpaceClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, spaceId),
      (model) =>
        EndSpaceClient.update({
          model,
          ctx,
          msgEvt: { t: "auth/unauthenticated" },
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
