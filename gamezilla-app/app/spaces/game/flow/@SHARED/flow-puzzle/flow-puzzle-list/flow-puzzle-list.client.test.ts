import { describe, expect, it } from "bun:test"
import {
  Err,
  Ok,
  Posix,
  RequestResponse,
  TimeSpan,
  isRequesting,
} from "gamezilla-app/@SHARED/core"
import { andThen } from "gamezilla-app/app/@SHARED/architecture/app-client"
import {
  didSendToServer,
  didShowErrorSm,
} from "gamezilla-app/app/@SHARED/client"
import { SpaceClientCtx } from "gamezilla-app/app/spaces/@SHARED/space"
import { testSpaceClientCtx } from "../../../../@SHARED/testing/client"
import { testFlowClientCtx } from "../../../create/@SHARED/testing/client"
import { FlowVariant, FlowVariantDimensions } from "../../flow"
import { FlowClientCtx } from "../../flow-ctx"
import { FlowPuzzle } from "../flow-puzzle"
import { FlowPuzzleListClient } from "./flow-puzzle-list.client"
import { ModelClient, initClient } from "./flow-puzzle-list.core"

const initial = {
  model: initClient,
}

const userObservedEndOfList = (ctx: SpaceClientCtx) => (model: ModelClient) => {
  return FlowPuzzleListClient.update({
    ctx,
    model,
    msg: {
      t: "flow-puzzle-list.user-observed-end-of-list",
    },
  })
}

const serverListedPuzzlesOk =
  (ctx: FlowClientCtx, puzzles: FlowPuzzle[]) => (model: ModelClient) => {
    return FlowPuzzleListClient.update({
      ctx,
      model,
      msgServer: {
        t: "flow-puzzle-list.listed-puzzle",
        listed: Ok({
          items: puzzles,
          limit: 25,
          offset: 0,
          total: puzzles.length,
        }),
      },
    })
  }

const serverListedPuzzlesErr =
  (ctx: FlowClientCtx, error: string) => (model: ModelClient) => {
    return FlowPuzzleListClient.update({
      ctx,
      model,
      msgServer: {
        t: "flow-puzzle-list.listed-puzzle",
        listed: Err(error),
      },
    })
  }

const elapsed =
  (ctx: FlowClientCtx, timeSpan: TimeSpan) => (model: ModelClient) => {
    return FlowPuzzleListClient.update({
      ctx: {
        ...ctx,
        now: Posix.add(ctx.now, timeSpan),
      },
      model,
      msg: { t: "flow-puzzle-list.elasped" },
    })
  }

describe(import.meta.file, () => {
  it("should it be requesting when the user observes the end of the list", async () => {
    const ctx = await testSpaceClientCtx()
    const output = andThen(initial, userObservedEndOfList(ctx))
    expect(isRequesting(output.model.request)).toBe(true)
  })

  it("should send a list puzzles message to server when the user observes the end of the list", async () => {
    const ctx = await testSpaceClientCtx()
    const output = andThen(initial, userObservedEndOfList(ctx))
    expect(
      didSendToServer(
        output,
        (msg) => msg.t === "flow-puzzle-list.list-puzzles",
      ),
    ).toBe(true)
  })

  it("should record puzzles recieved from server", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await FlowPuzzle.create({
      count: 1,
      createdAt: ctx.now,
      createdBy: ctx.currentUserId,
      flow: FlowVariant.init({
        dimensions: FlowVariantDimensions.init({
          t: "flow-grid",
          height: 5,
          width: 5,
        }),
        terminalsByGroupId: {},
      }),
    })

    const output = andThen(initial, serverListedPuzzlesOk(ctx, [puzzle]))

    expect(Object.values(output.model.puzzles)).not.toEqual([])
  })

  it("should show error when recieving list error fro server", async () => {
    const ctx = await testFlowClientCtx()
    const error = "Something went wrong"
    const output = andThen(initial, serverListedPuzzlesErr(ctx, error))
    expect(didShowErrorSm(output)).toBe(true)
  })

  it("should show error after no server response", async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(
      initial,
      userObservedEndOfList(ctx),
      elapsed(ctx, TimeSpan.fromMinutes(5)),
    )
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBe(true)
  })
})
