import { describe, expect, test } from "bun:test";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import { ClientCtx, routeChanged } from "gamezilla/@CHILD/app/@SHARED/client";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix, TimeSpan } from "gamezilla/@SHARED/core";
import * as Space from "../spaces-core/space";
import * as SpacesClient from "../spaces.client";
import * as Spaces from "../spaces.core";

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

const initial = async () => {
  return await SpacesClient.init({ ctx, stored: null });
};

const changeRouteToSpaceList = async (model: Spaces.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msgEvt: routeChanged({ t: "spaces", c: { t: "space-list" } }),
  });
};

const timePassed = (timeSpan: TimeSpan) => (model: Spaces.ModelClient) => {
  return SpacesClient.update({
    ctx: { ...ctx, now: Posix.add(ctx.now, timeSpan) },
    model,
    msg: { t: "time-passed" },
  });
};

const serverListedSpaces = async (model: Spaces.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msgServer: {
      t: "listed-spaces",
      spaces: [Space.init, Space.init, Space.init],
      causedBy: "list-spaces",
    },
  });
};

describe("list spaces client", () => {
  test("should request spaces on route change", async () => {
    const updated = await AppClientModule.chainUpdates(
      await initial(),
      changeRouteToSpaceList
    );
    expect(updated.model.listSpacesRequest.t === "loading").toBeTrue();
  });

  test("should timeout the request after some time", async () => {
    const updated = await AppClientModule.chainUpdates(
      await initial(),
      changeRouteToSpaceList,
      timePassed(TimeSpan.fromSeconds(10))
    );

    expect(updated.model.listSpacesRequest.t === "err").toBeTrue();
  });

  test("should be ok when server responds with a list of spaces", async () => {
    const updated = await AppClientModule.chainUpdates(
      await initial(),
      changeRouteToSpaceList,
      serverListedSpaces
    );

    expect(updated.model.listSpacesRequest.t === "ok").toBeTrue();
  });

  test("should be ok when server responds with a list of spaces even when it timed out", async () => {
    const updated = await AppClientModule.chainUpdates(
      await initial(),
      changeRouteToSpaceList,
      timePassed(TimeSpan.fromSeconds(10)),
      serverListedSpaces
    );

    expect(updated.model.listSpacesRequest.t === "ok").toBeTrue();
  });
});
