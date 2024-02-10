import { describe, expect, test } from "bun:test";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  didPlaySound,
  didPushRoute,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ctx,
  init,
  userClickedEndSpaceButton,
  userStartedSpace,
} from "../@TEST/client";

describe("end space client", () => {
  test("should redirect to space list after ending space if on space route", async () => {
    const spaceId = SpaceId.generate();
    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, ctx.currentUserId, spaceId),
      (model) =>
        userClickedEndSpaceButton(model, {
          ...ctx,
          currentRoute: { t: "spaces", c: { t: "space", spaceId } },
        })
    );

    expect(
      didPushRoute(updated, { t: "spaces", c: { t: "space-list" } })
    ).toBeTrue();
  });

  test("should not redirect to space list after ending space if not on space route", async () => {
    const spaceId = SpaceId.generate();

    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, ctx.currentUserId, spaceId),
      (model) =>
        userClickedEndSpaceButton(model, {
          ...ctx,
          currentRoute: {
            t: "profile",
            c: { t: "profile", userId: UserId.generate() },
          },
        })
    );

    expect(
      didPushRoute(updated, { t: "spaces", c: { t: "space-list" } })
    ).toBeFalse();
  });

  test("should play sound after ending space", async () => {
    const spaceId = SpaceId.generate();
    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, ctx.currentUserId, spaceId),
      (model) => userClickedEndSpaceButton(model)
    );
    expect(didPlaySound(updated)).toBeTrue();
  });
});
