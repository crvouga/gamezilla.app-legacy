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
import { SpacesRoutes } from "../@SHARED/space.routes"
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
  return changeRoute(ctx, SpacesRoutes.SpaceList())
}

describe(import.meta.file, () => {
  it("should request spaces on init if on space list route", async () => {
    const ctx = createCtx()
    const output = await init({
      ...ctx,
      currentRouteV2: SpacesRoutes.SpaceList(),
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
      currentRouteV2: SpacesRoutes.SpaceList(),
    })
    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "wire" && msgCmd.c.msg?.t === "list-spaces",
      ),
    ).toBeTrue()
  })

  it("should request spaces on space list route change", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      changeRouteToSpaceList(ctx),
    )
    expect(updated.model.listSpacesRequest.t === "loading").toBeTrue()
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
    ).toBeTrue()
  })

  it("should be ok when server responds with a list of spaces", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      changeRouteToSpaceList(ctx),
      serverListedSpaces(ctx),
    )
    expect(isResponseOk(updated.model.listSpacesRequest)).toBeTrue()
  })

  it("should be ok when server responds with a list of spaces even when it timed out", async () => {
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
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
    const updated = await AppClientModule.andThen(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
    )

    expect(didPushRoute(updated)).toBeTrue()
  })

  it("should make a nav forward sound when opening a space screen", async () => {
    const SpaceA = SpaceId.generate()
    const ctx = createCtx()
    const updated = await AppClientModule.andThen(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
    )
    expect(didPlaySound(updated, APP_SOUND.navForwardMin)).toBeTrue()
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
    expect(didPlaySound(updated, APP_SOUND.navBackwardMin)).toBeTrue()
  })
})
