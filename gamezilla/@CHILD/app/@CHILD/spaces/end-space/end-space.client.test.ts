import { describe, expect, test } from "bun:test";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import { didPushRoute } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ctx, init, userEndedSpace, userStartedSpace } from "../@TEST/client";

describe("end space client", () => {
  test("should redirect to space list after ending space if on space route", async () => {
    const spaceId = SpaceId.generate();
    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, ctx.currentUserId, spaceId),
      (model) =>
        userEndedSpace(model, ctx.currentUserId, spaceId, {
          ...ctx,
          currentRoute: { t: "spaces", c: { t: "space", spaceId } },
        })
    );

    expect(
      didPushRoute(updated, { t: "spaces", c: { t: "space-list" } })
    ).toBeTrue();
  });
});
