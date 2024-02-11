import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  didPushRoute,
  didReplaceRoute,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  RequestResponse,
  TimeSpan,
  isRequesting,
  isResponseOk,
} from "gamezilla/@SHARED/core"
import {
  changeRoute,
  clickBackButton,
  clickSpaceCard,
  ctx,
  init,
  serverListedSpaces,
  timePassed,
} from "../@TEST/client"
import { ModelClient } from "../spaces.core"

const changeRouteToSpaceList = (model: ModelClient) => {
  return changeRoute(model, { t: "spaces", c: { t: "space-list" } })
}

describe("list spaces client", () => {
  it("shoudld request spaces on init if on space list route", async () => {
    const updated = await init({
      ...ctx,
      currentRoute: { t: "spaces", c: { t: "space-list" } },
    })
    expect(
      isRequesting(updated.model.listSpacesRequest) &&
        updated.model.listSpacesRequest.requestedAt === ctx.now,
    ).toBeTrue()
  })

  it("should request spaces on space list route change", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList,
    )
    expect(updated.model.listSpacesRequest.t === "loading").toBeTrue()
  })

  it("should timeout the request after some time", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList,
      timePassed(TimeSpan.fromSeconds(10)),
    )

    expect(
      RequestResponse.didRequestTimeout(updated.model.listSpacesRequest),
    ).toBeTrue()
  })

  it("should be ok when server responds with a list of spaces", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList,
      serverListedSpaces,
    )
    expect(isResponseOk(updated.model.listSpacesRequest)).toBeTrue()
  })

  it("should be ok when server responds with a list of spaces even when it timed out", async () => {
    const updated = await AppClientModule.chainUpdates(
      await init(),
      changeRouteToSpaceList,
      timePassed(TimeSpan.fromSeconds(10)),
      serverListedSpaces,
    )

    expect(isResponseOk(updated.model.listSpacesRequest)).toBeTrue()
  })

  it("should navigate to space screen after clicking a space card", async () => {
    const SpaceA = SpaceId.generate()
    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => serverListedSpaces(model, [SpaceA]),
      (model) => clickSpaceCard(model, SpaceA),
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

    const updated = await AppClientModule.chainUpdates(
      await init(),
      (model) => serverListedSpaces(model, [SpaceA]),
      (model) => clickSpaceCard(model, SpaceA),
      (model) => clickBackButton(model, "join-screen"),
    )

    expect(
      didReplaceRoute(updated, { t: "spaces", c: { t: "space-list" } }),
    ).toBeTrue()
  })
})
