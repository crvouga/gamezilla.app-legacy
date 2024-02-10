import { describe, expect, test } from "bun:test";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  clickedLeaveSpaceButton,
  ctx,
  init,
  userJoinedSpace,
  userStartedSpace,
} from "../@TEST/client";
import { Spaces } from "../spaces-core";

describe("leave space", () => {
  test("user is not in space after leaving", async () => {
    const spaceId = SpaceId.generate();
    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, UserId.generate(), spaceId),
      (model) => userJoinedSpace(model, ctx.currentUserId, spaceId),
      (model) => clickedLeaveSpaceButton(model)
    );

    expect(Spaces.toSpaceIdByUserId(updated.model, ctx.currentUserId)).toEqual(
      null
    );
  });

  test("should play sound after leaving", async () => {
    const spaceId = SpaceId.generate();

    const joined = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, UserId.generate(), spaceId),
      (model) => userJoinedSpace(model, ctx.currentUserId, spaceId)
    );

    const left = await AppClientModule.chainUpdates(
      { model: joined.model },
      (model) => clickedLeaveSpaceButton(model)
    );

    expect(didPlaySound(left)).toBeTrue();
  });
});
