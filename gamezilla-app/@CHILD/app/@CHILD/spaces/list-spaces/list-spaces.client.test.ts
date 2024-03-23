import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  APP_SOUND,
  ClientCtx,
  didPlaySound,
  didPushRoute,
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
  clickSpaceCard,
  clickedGoHomeButton,
  createCtx,
  elapsed,
  init,
  serverListedSpaces,
} from "../@TEST/client"

const changeRouteToSpaceList = (ctx: ClientCtx) => {
  return changeRoute(ctx, { n: "spaces", t: "space-list" })
}

describe(import.meta.file, () => {
  it("should request spaces on init if on space list route", async () => {
    const ctx = createCtx()
    const output = await init({
      ...ctx,
      currentRoute: { n: "spaces", t: "space-list" },
    })
    expect(
      isRequesting(output.model.listSpacesRequest) &&
        output.model.listSpacesRequest.requestedAt === ctx.now,
    ).toBe(true)
  })

  it("should send list space request to server initially", async () => {
    const ctx = createCtx()
    const output = await init({
      ...ctx,
      currentRoute: { n: "spaces", t: "space-list" },
    })
    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "wire" && msgCmd.c.msg?.t === "list-spaces",
      ),
    ).toBe(true)
  })

  it("should request spaces on space list route change", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      changeRouteToSpaceList(ctx),
    )
    expect(updated.model.listSpacesRequest.t === "loading").toBe(true)
  })

  it("should timeout request", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      changeRouteToSpaceList(ctx),
      elapsed(ctx, TimeSpan.fromMinutes(5)),
    )

    expect(
      RequestResponse.didRequestTimeout(updated.model.listSpacesRequest),
    ).toBe(true)
  })

  it("should be ok when server responds with a list of spaces", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      changeRouteToSpaceList(ctx),
      serverListedSpaces(ctx),
    )
    expect(isResponseOk(updated.model.listSpacesRequest)).toBe(true)
  })

  it("should be ok when server responds with a list of spaces even when it timed out", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      changeRouteToSpaceList(ctx),
      elapsed(ctx, TimeSpan.fromSeconds(10)),
      serverListedSpaces(ctx),
    )

    expect(isResponseOk(updated.model.listSpacesRequest)).toBe(true)
  })

  it("should navigate to space screen after clicking a space card", async () => {
    const SpaceA = SpaceId.generate()
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
    )

    expect(didPushRoute(updated)).toBe(true)
  })

  it("should make a nav forward sound when opening a space screen", async () => {
    const SpaceA = SpaceId.generate()
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
    )
    expect(didPlaySound(updated, APP_SOUND.navForwardMin)).toBe(true)
  })

  it("should make a sound when closing room screen", async () => {
    const SpaceA = SpaceId.generate()
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
      clickedGoHomeButton(ctx),
    )
    expect(didPlaySound(updated, APP_SOUND.navBackwardMin)).toBe(true)
  })
})
