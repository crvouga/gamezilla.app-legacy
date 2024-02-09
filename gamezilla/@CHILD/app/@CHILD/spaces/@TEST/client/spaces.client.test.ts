import { expect, test } from "bun:test";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ClientCtx, didShowErrorSm } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { AppClientModule } from "../../../../@SHARED/architecture/app-client";
import * as Spaces from "../../spaces-core/spaces";
import * as SpaceClient from "../../spaces.client";
import * as SpaceCore from "../../spaces.core";

const ctx: ClientCtx = {
  currentRoute: {
    t: "spaces",
    c: {
      t: "space-list",
    },
  },
  documentVisibilityState: "visible",
  now: Posix.now(),
  profiles: {},
  currentUserId: UserId.generate(),
};

function init() {
  return SpaceClient.init({ ctx, stored: null });
}

function userStartedSpace(
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId
) {
  return SpaceClient.update({
    ctx,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-started-space",
        spaceId,
        userId,
      }),
    },
  });
}

function userJoinedSpace(
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId
) {
  return SpaceClient.update({
    ctx,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-joined-space",
        spaceId: spaceId,
        userId: userId,
      }),
    },
  });
}

function userLeftSpace(
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId
) {
  return SpaceClient.update({
    ctx,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-left-space",
        spaceId: spaceId,
        userId: userId,
      }),
    },
  });
}

test("current user starting space", async () => {
  const spaceId = SpaceId.generate();

  const initial = await init();

  const started = await userStartedSpace(
    initial.model,
    ctx.currentUserId,
    spaceId
  );

  const before = Spaces.toSpaceIdByUserId(initial.model, ctx.currentUserId);
  const after = Spaces.toSpaceIdByUserId(started.model, ctx.currentUserId);

  expect(before).toEqual(null);
  expect(after).toEqual(spaceId);
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
    ).length
  ).toBe(1);
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
