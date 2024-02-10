import { describe, expect, test } from "bun:test";
import { didPushRoute } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import { AppClientModule } from "../../../@SHARED/architecture/app-client";
import { Spaces } from "../spaces-core";
import { ctx, init, userStartedSpace } from "../@TEST/client";

describe("start space client", () => {
  test("current user starting space", async () => {
    const spaceId = SpaceId.generate();

    const started = await AppClientModule.chainUpdates(await init(), (model) =>
      userStartedSpace(model, ctx.currentUserId, spaceId)
    );

    expect(Spaces.toSpaceIdByUserId(started.model, ctx.currentUserId)).toEqual(
      spaceId
    );
  });

  test("redirecting when starting a space", async () => {
    const spaceId = SpaceId.generate();

    const started = await AppClientModule.chainUpdates(await init(), (model) =>
      userStartedSpace(model, ctx.currentUserId, spaceId)
    );

    expect(
      didPushRoute(started, { t: "spaces", c: { t: "space", spaceId } })
    ).toBeTrue();
  });
});
