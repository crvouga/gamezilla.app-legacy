import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/app/@SHARED/architecture/app-client"
import {
  didSendToServer,
  didShowErrorSm,
} from "gamezilla-app/app/@SHARED/client"
import {
  Err,
  Ok,
  Posix,
  RequestResponse,
  TimeSpan,
} from "gamezilla-app/@SHARED/core"
import { FlowClientCtx } from "../../flow-ctx"
import { FlowPack } from "../flow-pack"
import { FlowPackListClient } from "./flow-pack-list.client"
import { ModelClient, initClient } from "./flow-pack-list.core"
import { testFlowClientCtx } from "../../../create/@SHARED/testing/client"

const initial = {
  model: initClient,
}

const observedEndOfList = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx,
    model,
    msg: {
      t: "user-observed-end-of-list",
    },
  })
}

const elasped =
  (ctx: FlowClientCtx, timeSpan: TimeSpan) => (model: ModelClient) => {
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
  (ctx: FlowClientCtx, ...packs: FlowPack[]) =>
  (model: ModelClient) => {
    return FlowPackListClient.update({
      ctx: ctx,
      model,
      msgServer: {
        t: "listed-packs",
        listed: Ok({
          items: packs,
          limit: 25,
          offset: 0,
          total: packs.length,
        }),
      },
    })
  }

const serverListedPacksErr =
  (ctx: FlowClientCtx, errorMessage: string) => (model: ModelClient) => {
    return FlowPackListClient.update({
      ctx,
      model,
      msgServer: {
        t: "listed-packs",
        listed: Err(errorMessage),
      },
    })
  }

describe(import.meta.file, () => {
  it("should be request when user observes end of list", async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(initial, observedEndOfList(ctx))
    expect(RequestResponse.isRequesting(output.model.request)).toBe(true)
  })

  it("should send request to server when user observes end of list", async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(initial, observedEndOfList(ctx))
    expect(didSendToServer(output, (msg) => msg.t === "list-packs")).toBe(true)
  })

  it("should timeout request", async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(
      initial,
      observedEndOfList(ctx),
      elasped(ctx, TimeSpan.fromMinutes(5)),
    )
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBe(true)
  })

  it("should add packs listed from server", async () => {
    const ctx = await testFlowClientCtx()
    const pack = await FlowPack.create({
      createdBy: ctx.currentUserId,
      now: ctx.now,
      puzzleIds: [],
    })
    const output = AppClientModule.andThen(
      initial,
      serverListedPacksOk(ctx, pack),
    )
    expect(Object.values(output.model.packs)).toEqual([pack])
  })

  it("should show error when packs listed from server errors", async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(
      initial,
      serverListedPacksErr(ctx, "Something went wrong"),
    )
    expect(didShowErrorSm(output)).toBe(true)
  })
})
