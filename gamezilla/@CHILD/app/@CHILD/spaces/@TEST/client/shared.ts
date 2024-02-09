import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ClientCtx, routeChanged } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix, TimeSpan } from "gamezilla/@SHARED/core";
import * as SpaceClient from "../../spaces.client";
import * as SpaceCore from "../../spaces.core";
import { Space } from "../../spaces-core";

export const ctx: ClientCtx = {
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

export const init = () => {
  return SpaceClient.init({ ctx, stored: null });
};

export const userStartedSpace = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId
) => {
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
};

export const userJoinedSpace = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId
) => {
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
};

export const userLeftSpace = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId
) => {
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
};

export const changeRouteToSpaceList = async (model: SpaceCore.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: routeChanged({ t: "spaces", c: { t: "space-list" } }),
  });
};

export const timePassed =
  (timeSpan: TimeSpan) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx: { ...ctx, now: Posix.add(ctx.now, timeSpan) },
      model,
      msg: { t: "time-passed" },
    });
  };

export const serverListedSpaces = async (model: SpaceCore.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgServer: {
      t: "listed-spaces",
      spaces: [Space.init, Space.init, Space.init],
      causedBy: "list-spaces",
    },
  });
};
