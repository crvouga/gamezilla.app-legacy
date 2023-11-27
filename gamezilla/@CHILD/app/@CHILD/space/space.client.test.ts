import { expect, test } from "bun:test";
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { withMeta } from "gamezilla/@SHARED/event-stream";
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
  now: Posix.now(),
  profiles: {},
  currentUserId: UserId.generate(),
};

test("current user starting space", async () => {
  const spaceId = SpaceId.generate();

  const initial = SpaceClient.init({ stored: null });

  const started = SpaceClient.update({
    ctx,
    model: initial.model,
    msg: withMeta({
      t: "user-started-space",
      spaceId: spaceId,
      userId: ctx.currentUserId,
    }),
  });

  const before = SpaceCore.toStateUser(initial.model, ctx.currentUserId);
  const after = SpaceCore.toStateUser(started.model, ctx.currentUserId);

  expect(before).toEqual({ spaceId: null, userId: ctx.currentUserId });
  expect(after).toEqual({ spaceId: spaceId, userId: ctx.currentUserId });
  //
});

test("current user joining started space", async () => {
  const spaceId = SpaceId.generate();

  const initial = SpaceClient.init({ stored: null });

  const started = SpaceClient.update({
    ctx,
    model: initial.model,
    msg: withMeta({
      t: "user-started-space",
      spaceId: spaceId,
      userId: UserId.generate(),
    }),
  });

  const joined = SpaceClient.update({
    ctx,
    model: started.model,
    msg: withMeta({
      t: "user-joined-space",
      spaceId,
      userId: ctx.currentUserId,
    }),
  });

  const before = SpaceCore.toStateUser(started.model, ctx.currentUserId);
  const after = SpaceCore.toStateUser(joined.model, ctx.currentUserId);

  expect(before).toEqual({ spaceId: null, userId: ctx.currentUserId });
  expect(after).toEqual({ spaceId: spaceId, userId: ctx.currentUserId });
  //
});
