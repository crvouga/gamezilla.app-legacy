import { expect, test } from "bun:test";
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { withId } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import * as SpaceClient from "./space.client";
import * as SpaceCore from "./space.core";

const ctx: ClientCtx = {
  currentRoute: {
    t: "space",
    c: {
      t: "space-list",
    },
  },
  documentVisibilityState: "visible",
  now: Posix.now$(),
  profiles: {},
  currentUserId: UserId.generate$(),
};

function init() {
  return SpaceClient.init({ ctx, stored: null });
}

function userStartedSpace(input: {
  model: SpaceCore.ClientModel;
  userId: UserId;
  spaceId: SpaceId;
}) {
  return SpaceClient.update({
    ctx,
    model: input.model,
    msg: {
      t: "event",
      c: withId({
        t: "user-started-space",
        spaceId: input.spaceId,
        userId: input.userId,
      }),
    },
  });
}

function userJoinedSpace(input: {
  model: SpaceCore.ClientModel;
  userId: UserId;
  spaceId: SpaceId;
}) {
  return SpaceClient.update({
    ctx,
    model: input.model,
    msg: {
      t: "event",
      c: withId({
        t: "user-joined-space",
        spaceId: input.spaceId,
        userId: input.userId,
      }),
    },
  });
}

function userLeftSpace(input: {
  model: SpaceCore.ClientModel;
  userId: UserId;
  spaceId: SpaceId;
}) {
  return SpaceClient.update({
    ctx,
    model: input.model,
    msg: {
      t: "event",
      c: withId({
        t: "user-left-space",
        spaceId: input.spaceId,
        userId: input.userId,
      }),
    },
  });
}

test("current user starting space", async () => {
  const spaceId = SpaceId.generate$();

  const initial = init();

  const started = userStartedSpace({
    model: initial.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const before = SpaceCore.toUserState(initial.model, ctx.currentUserId);
  const after = SpaceCore.toUserState(started.model, ctx.currentUserId);

  expect(before).toEqual({ spaceId: null, userId: ctx.currentUserId });
  expect(after).toEqual({ spaceId: spaceId, userId: ctx.currentUserId });
});

test("redirecting when starting a space", async () => {
  const spaceId = SpaceId.generate$();

  const initial = init();

  const started = userStartedSpace({
    model: initial.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  expect(
    started.cmd?.filter(
      (cmd) =>
        cmd.t === "routing" &&
        cmd.c.t === "push" &&
        cmd.c.route.t === "space" &&
        cmd.c.route.c.t === "space" &&
        cmd.c.route.c.spaceId === spaceId
    ).length
  ).toBe(1);
});

test("current user joining started space", async () => {
  const spaceId = SpaceId.generate$();

  const initial = init();

  const started = userStartedSpace({
    model: initial.model,
    spaceId,
    userId: UserId.generate$(),
  });

  const joined = userJoinedSpace({
    model: started.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const before = SpaceCore.toUserState(started.model, ctx.currentUserId);
  const after = SpaceCore.toUserState(joined.model, ctx.currentUserId);

  expect(before).toEqual({ spaceId: null, userId: ctx.currentUserId });
  expect(after).toEqual({ spaceId: spaceId, userId: ctx.currentUserId });
  //
});

test("current user leaving joined space", async () => {
  const spaceId = SpaceId.generate$();

  const initial = init();

  const started = userStartedSpace({
    model: initial.model,
    spaceId,
    userId: UserId.generate$(),
  });

  const joined = userJoinedSpace({
    model: started.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const left = userLeftSpace({
    model: joined.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const before = SpaceCore.toUserState(joined.model, ctx.currentUserId);
  const after = SpaceCore.toUserState(left.model, ctx.currentUserId);

  expect(before).toEqual({ spaceId: spaceId, userId: ctx.currentUserId });
  expect(after).toEqual({ spaceId: null, userId: ctx.currentUserId });
  //
});

test("prevent joining a space if already in a space", async () => {
  const spaceIdA = SpaceId.generate$();
  const spaceIdB = SpaceId.generate$();

  const initial = init();

  const startedA = userStartedSpace({
    model: initial.model,
    spaceId: spaceIdA,
    userId: UserId.generate$(),
  });

  const joinedA = userJoinedSpace({
    model: startedA.model,
    spaceId: spaceIdA,
    userId: ctx.currentUserId,
  });

  const startedB = userStartedSpace({
    model: joinedA.model,
    spaceId: spaceIdB,
    userId: UserId.generate$(),
  });

  const joinedB = userLeftSpace({
    model: startedB.model,
    spaceId: spaceIdB,
    userId: ctx.currentUserId,
  });

  const before = SpaceCore.toUserState(joinedA.model, ctx.currentUserId);
  const after = SpaceCore.toUserState(joinedB.model, ctx.currentUserId);

  expect(before).toEqual({ spaceId: spaceIdA, userId: ctx.currentUserId });
  expect(after).toEqual({ spaceId: spaceIdA, userId: ctx.currentUserId });
  //
});
