import { describe, expect, test } from "bun:test";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import { TimeSpan } from "gamezilla/@SHARED/core";
import {
  changeRouteToSpaceList,
  init,
  serverListedSpaces,
  timePassed,
} from "./shared";

describe("list spaces client", () => {
  test("should request spaces on route change", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList
    );
    expect(updated.model.listSpacesRequest.t === "loading").toBeTrue();
  });

  test("should timeout the request after some time", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList,
      timePassed(TimeSpan.fromSeconds(10))
    );

    expect(updated.model.listSpacesRequest.t === "err").toBeTrue();
  });

  test("should be ok when server responds with a list of spaces", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList,
      serverListedSpaces
    );
    expect(updated.model.listSpacesRequest.t === "ok").toBeTrue();
  });

  test("should be ok when server responds with a list of spaces even when it timed out", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList,
      timePassed(TimeSpan.fromSeconds(10)),
      serverListedSpaces
    );

    expect(updated.model.listSpacesRequest.t === "ok").toBeTrue();
  });
});
