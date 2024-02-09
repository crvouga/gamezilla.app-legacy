import { expect, test } from "bun:test";
import { didShowErrorSm } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { AppClientModule } from "../../../../@SHARED/architecture/app-client";
import { Spaces } from "../../spaces-core";
import {
  ctx,
  init,
  userJoinedSpace,
  userLeftSpace,
  userStartedSpace,
} from "./shared";

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

  const initial = await init();

  const started = await userStartedSpace(
    initial.model,
    ctx.currentUserId,
    spaceId
  );

  expect(
    started.msgCmd?.filter(
      (msgCmd) =>
        msgCmd.t === "routing" &&
        msgCmd.c.t === "push" &&
        msgCmd.c.route.t === "spaces" &&
        msgCmd.c.route.c.t === "space" &&
        msgCmd.c.route.c.spaceId === spaceId
    )
  ).toHaveLength(1);
});

test("current user joining started space", async () => {
  const spaceId = SpaceId.generate();

  const initial = await init();

  const joined = await AppClientModule.chainUpdates(
    initial,
    (model) => userStartedSpace(model, UserId.generate(), spaceId),
    (model) => userJoinedSpace(model, ctx.currentUserId, spaceId)
  );

  const before = Spaces.toSpaceIdByUserId(initial.model, ctx.currentUserId);

  const after = Spaces.toSpaceIdByUserId(joined.model, ctx.currentUserId);

  expect(before).toEqual(null);
  expect(after).toEqual(spaceId);
  //
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
