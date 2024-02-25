import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  didSendToServer,
  didShowErrorSm,
} from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Posix,
  RequestResponse,
  TimeSpan,
  err,
  ok,
} from "gamezilla/@SHARED/core"
import { FlowPackListClient } from "."
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { FlowPack } from "../flow-pack"
import { ModelClient, initClient } from "./flow-pack-list.core"

const initial = {
  model: initClient,
}

const observedEndOfList = (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx: testSpaceClientCtx,
    model,
    msg: {
      t: "user-observed-end-of-list",
    },
  })
}

const elasped = (timeSpan: TimeSpan) => (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx: {
      ...testSpaceClientCtx,
      now: Posix.add(testSpaceClientCtx.now, timeSpan),
    },
    model,
    msg: { t: "elapsed" },
  })
}

const serverListedPacksOk =
  (...packs: FlowPack[]) =>
  (model: ModelClient) => {
    return FlowPackListClient.update({
      ctx: testSpaceClientCtx,
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
    ctx: testSpaceClientCtx,
    model,
    msgServer: {
      t: "listed-packs",
      listed: err(errorMessage),
    },
  })
}

describe(import.meta.file, () => {
  it("should be request when user observes end of list", async () => {
    const output = await AppClientModule.chainUpdates(
      initial,
      observedEndOfList,
    )
    expect(RequestResponse.isRequesting(output.model.request)).toBeTrue()
  })

  it("should send request to server when user observes end of list", async () => {
    const output = await AppClientModule.chainUpdates(
      initial,
      observedEndOfList,
    )
    expect(didSendToServer(output, (msg) => msg.t === "list-packs")).toBeTrue()
  })

  it("should timeout request", async () => {
    const output = await AppClientModule.chainUpdates(
      initial,
      observedEndOfList,
      elasped(TimeSpan.fromSeconds(10)),
    )
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBeTrue()
  })

  it("should add packs listed from server", async () => {
    const pack = FlowPack.create({
      createdBy: testSpaceClientCtx.currentUserId,
      now: testSpaceClientCtx.now,
      puzzleIds: [],
    })
    const output = await AppClientModule.chainUpdates(
      initial,
      serverListedPacksOk(pack),
    )
    expect(Object.values(output.model.packs)).toEqual([pack])
  })

  it("should show error when packs listed from server errors", async () => {
    const output = await AppClientModule.chainUpdates(
      initial,
      serverListedPacksErr("Something went wrong"),
    )
    expect(didShowErrorSm(output)).toBeTrue()
  })
})
