import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  ClientCtx,
  didPushRoute,
  didReplaceRoute,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import {
  RequestResponse,
  TimeSpan,
  isRequesting,
  isResponseOk,
} from "gamezilla-app/@SHARED/core"
import {
  changeRoute,
  clickBackButton,
  clickSpaceCard,
  createCtx,
  init,
  serverListedSpaces,
  elapsed,
} from "../@TEST/client"

const changeRouteToSpaceList = (ctx: ClientCtx) => {
  return changeRoute(ctx, { t: "spaces", c: { t: "space-list" } })
}

describe(import.meta.file, () => {
  it("should request spaces on init if on space list route", async () => {
    const ctx = createCtx()
    const output = await init({
      ...ctx,
      currentRoute: { t: "spaces", c: { t: "space-list" } },
    })
    expect(
      isRequesting(output.model.listSpacesRequest) &&
        output.model.listSpacesRequest.requestedAt === ctx.now,
    ).toBeTrue()
  })

  it("should send list space request to server initially", async () => {
    const ctx = createCtx()
    const output = await init({
      ...ctx,
      currentRoute: { t: "spaces", c: { t: "space-list" } },
    })
    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "wire" && msgCmd.c.msg?.t === "list-spaces",
      ),
    ).toBeTrue()
  })

  it("should request spaces on space list route change", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      changeRouteToSpaceList(ctx),
    )
    expect(updated.model.listSpacesRequest.t === "loading").toBeTrue()
  })

  it("should timeout request", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      changeRouteToSpaceList(ctx),
      elapsed(ctx, TimeSpan.fromMinutes(5)),
    )

    expect(
      RequestResponse.didRequestTimeout(updated.model.listSpacesRequest),
    ).toBeTrue()
  })

  it("should be ok when server responds with a list of spaces", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      changeRouteToSpaceList(ctx),
      serverListedSpaces(ctx),
    )
    expect(isResponseOk(updated.model.listSpacesRequest)).toBeTrue()
  })

  it("should be ok when server responds with a list of spaces even when it timed out", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      changeRouteToSpaceList(ctx),
      elapsed(ctx, TimeSpan.fromSeconds(10)),
      serverListedSpaces(ctx),
    )

    expect(isResponseOk(updated.model.listSpacesRequest)).toBeTrue()
  })

  it("should navigate to space screen after clicking a space card", async () => {
    const SpaceA = SpaceId.generate()
    const ctx = createCtx()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
    )

    expect(
      didPushRoute(updated, {
        t: "spaces",
        c: { t: "space", spaceId: SpaceA },
      }),
    ).toBeTrue()
  })

  it("should go back to list screen when clicking back button in join screen", async () => {
    const SpaceA = SpaceId.generate()
    const ctx = createCtx()
    const updated = await AppClientModule.chainUpdates(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
      clickBackButton(ctx, "join-screen"),
    )

    expect(
      didReplaceRoute(updated, { t: "spaces", c: { t: "space-list" } }),
    ).toBeTrue()
  })
})
