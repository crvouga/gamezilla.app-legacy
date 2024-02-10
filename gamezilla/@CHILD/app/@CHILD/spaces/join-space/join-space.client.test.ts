import { describe, expect, test } from "bun:test";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Spaces } from "../spaces-core";
import {
  ctx,
  init,
  userJoinedSpace,
  userLeftSpace,
  userStartedSpace,
} from "../@TEST/client";
import { didShowErrorSm } from "gamezilla/@CHILD/app/@SHARED/client";

describe("list spaces client", () => {
  test("current user joining started space", async () => {
    const spaceId = SpaceId.generate();

    const joined = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, UserId.generate(), spaceId),
      (model) => userJoinedSpace(model, ctx.currentUserId, spaceId)
    );

    expect(Spaces.toSpaceIdByUserId(joined.model, ctx.currentUserId)).toEqual(
      spaceId
    );
  });

  test("current user leaving joined space", async () => {
    const spaceId = SpaceId.generate();

    const initial = await init();

    const started = await userStartedSpace(
      initial.model,
      UserId.generate(),
      spaceId
    );

    const joined = await userJoinedSpace(
      started.model,
      ctx.currentUserId,
      spaceId
    );

    const left = await userLeftSpace(joined.model, ctx.currentUserId, spaceId);

    const before = Spaces.toSpaceIdByUserId(joined.model, ctx.currentUserId);
    const after = Spaces.toSpaceIdByUserId(left.model, ctx.currentUserId);

    expect(before).toEqual(spaceId);
    expect(after).toEqual(null);
    //
  });

  test("preventing joining a space if already in a space", async () => {
    const SpaceA = SpaceId.generate();
    const SpaceB = SpaceId.generate();

    const arranged = await AppClientModule.chainUpdates(
      await init(),
      (model) => userStartedSpace(model, UserId.generate(), SpaceA),
      (model) => userJoinedSpace(model, ctx.currentUserId, SpaceA)
    );

    const joined = await AppClientModule.chainUpdates(
      { model: arranged.model },
      (model) => userStartedSpace(model, UserId.generate(), SpaceB),
      (model) => userJoinedSpace(model, ctx.currentUserId, SpaceB)
    );

    expect(Spaces.toSpaceIdByUserId(arranged.model, ctx.currentUserId)).toEqual(
      SpaceA
    );

    expect(didShowErrorSm(joined)).toBeTrue();
  });
});
