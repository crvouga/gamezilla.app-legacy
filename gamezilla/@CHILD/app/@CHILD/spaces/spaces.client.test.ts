import { expect, test } from "bun:test";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import * as Spaces from "./spaces-core/spaces";
import * as SpaceClient from "./spaces.client";
import * as SpaceCore from "./spaces.core";

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

function userStartedSpace(input: {
  model: SpaceCore.ClientModel;
  userId: UserId;
  spaceId: SpaceId;
}) {
  return SpaceClient.update({
    ctx,
    model: input.model,
    msg: {
      t: "msgEvent",
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
      t: "msgEvent",
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
      t: "msgEvent",
      c: withId({
        t: "user-left-space",
        spaceId: input.spaceId,
        userId: input.userId,
      }),
    },
  });
}

test("current user starting space", async () => {
  const spaceId = SpaceId.generate();

  const initial = await init();

  const started = await userStartedSpace({
    model: initial.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const before = Spaces.toSpaceIdByUserId({
    model: initial.model,
    userId: ctx.currentUserId,
  });
  const after = Spaces.toSpaceIdByUserId({
    model: started.model,
    userId: ctx.currentUserId,
  });

  expect(before).toEqual(null);
  expect(after).toEqual(spaceId);
});

test("redirecting when starting a space", async () => {
  const spaceId = SpaceId.generate();

  const initial = await init();

  const started = await userStartedSpace({
    model: initial.model,
    spaceId,
    userId: ctx.currentUserId,
  });

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

  const started = await userStartedSpace({
    model: initial.model,
    spaceId,
    userId: UserId.generate(),
  });

  const joined = await userJoinedSpace({
    model: started.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const before = Spaces.toSpaceIdByUserId({
    model: started.model,
    userId: ctx.currentUserId,
  });
  const after = Spaces.toSpaceIdByUserId({
    model: joined.model,
    userId: ctx.currentUserId,
  });

  expect(before).toEqual(null);
  expect(after).toEqual(spaceId);
  //
});

test("current user leaving joined space", async () => {
  const spaceId = SpaceId.generate();

  const initial = await init();

  const started = await userStartedSpace({
    model: initial.model,
    spaceId,
    userId: UserId.generate(),
  });

  const joined = await userJoinedSpace({
    model: started.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const left = await userLeftSpace({
    model: joined.model,
    spaceId,
    userId: ctx.currentUserId,
  });

  const before = Spaces.toSpaceIdByUserId({
    model: joined.model,
    userId: ctx.currentUserId,
  });
  const after = Spaces.toSpaceIdByUserId({
    model: left.model,
    userId: ctx.currentUserId,
  });

  expect(before).toEqual(spaceId);
  expect(after).toEqual(null);
  //
});

test("prmsgEvent joining a space if already in a space", async () => {
  const spaceIdA = SpaceId.generate();
  const spaceIdB = SpaceId.generate();

  const initial = await init();

  const startedA = await userStartedSpace({
    model: initial.model,
    spaceId: spaceIdA,
    userId: UserId.generate(),
  });

  const joinedA = await userJoinedSpace({
    model: startedA.model,
    spaceId: spaceIdA,
    userId: ctx.currentUserId,
  });

  const startedB = await userStartedSpace({
    model: joinedA.model,
    spaceId: spaceIdB,
    userId: UserId.generate(),
  });

  const joinedB = await userLeftSpace({
    model: startedB.model,
    spaceId: spaceIdB,
    userId: ctx.currentUserId,
  });

  const before = Spaces.toSpaceIdByUserId({
    model: joinedA.model,
    userId: ctx.currentUserId,
  });
  const after = Spaces.toSpaceIdByUserId({
    model: joinedB.model,
    userId: ctx.currentUserId,
  });

  expect(before).toEqual(spaceIdA);
  expect(after).toEqual(spaceIdA);
  //
});
