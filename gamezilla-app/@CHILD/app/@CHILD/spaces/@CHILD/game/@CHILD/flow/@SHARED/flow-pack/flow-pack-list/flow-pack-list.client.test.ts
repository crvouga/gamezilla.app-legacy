import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  didSendToServer,
  didShowErrorSm,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  Posix,
  RequestResponse,
  TimeSpan,
  err,
  ok,
} from "gamezilla-app/@SHARED/core"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { FlowPack } from "../flow-pack"
import { FlowPackListClient } from "./flow-pack-list.client"
import { ModelClient, initClient } from "./flow-pack-list.core"

const initial = {
  model: initClient,
}

const ctx = testSpaceClientCtx()

const observedEndOfList = (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx: ctx,
    model,
    msg: {
      t: "user-observed-end-of-list",
    },
  })
}

const elasped = (timeSpan: TimeSpan) => (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx: {
      ...ctx,
      now: Posix.add(ctx.now, timeSpan),
    },
    model,
    msg: { t: "elapsed" },
  })
}

const serverListedPacksOk =
  (...packs: FlowPack[]) =>
  (model: ModelClient) => {
    return FlowPackListClient.update({
      ctx: ctx,
      model,
      msgServer: {
        t: "listed-packs",
        listed: ok({
          items: packs,
          limit: 25,
          offset: 0,
          total: packs.length,
        }),
      },
    })
  }

const serverListedPacksErr = (errorMessage: string) => (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx: ctx,
    model,
    msgServer: {
      t: "listed-packs",
      listed: err(errorMessage),
    },
  })
}

describe(import.meta.file, () => {
  it("should be request when user observes end of list", async () => {
    const output = await AppClientModule.andThen(initial, observedEndOfList)
    expect(RequestResponse.isRequesting(output.model.request)).toBeTrue()
  })

  it("should send request to server when user observes end of list", async () => {
    const output = await AppClientModule.andThen(initial, observedEndOfList)
    expect(didSendToServer(output, (msg) => msg.t === "list-packs")).toBeTrue()
  })

  it("should timeout request", async () => {
    const output = await AppClientModule.andThen(
      initial,
      observedEndOfList,
      elasped(TimeSpan.fromMinutes(5)),
    )
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBeTrue()
  })

  it("should add packs listed from server", async () => {
    const pack = FlowPack.create({
      createdBy: ctx.currentUserId,
      now: ctx.now,
      puzzleIds: [],
    })
    const output = await AppClientModule.andThen(
      initial,
      serverListedPacksOk(pack),
    )
    expect(Object.values(output.model.packs)).toEqual([pack])
  })

  it("should show error when packs listed from server errors", async () => {
    const output = await AppClientModule.andThen(
      initial,
      serverListedPacksErr("Something went wrong"),
    )
    expect(didShowErrorSm(output)).toBeTrue()
  })
})
