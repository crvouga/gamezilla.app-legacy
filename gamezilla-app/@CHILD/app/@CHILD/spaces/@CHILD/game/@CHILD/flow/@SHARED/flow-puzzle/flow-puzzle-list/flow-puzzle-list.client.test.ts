import { describe, expect, it } from "bun:test"
import { SpaceClientCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { chainUpdates } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  didSendToServer,
  didShowErrorSm,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  Posix,
  RequestResponse,
  TimeSpan,
  err,
  isRequesting,
  ok,
} from "gamezilla-app/@SHARED/core"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { testFlowClientCtx } from "../../../@CHILD/create/@TEST/client"
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
        listed: ok({
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
        listed: err(error),
      },
    })
  }

const elapsed = (timeSpan: TimeSpan) => (model: ModelClient) => {
  const ctx = testSpaceClientCtx()
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
    const ctx = testSpaceClientCtx()
    const output = await chainUpdates(initial, userObservedEndOfList(ctx))
    expect(isRequesting(output.model.request)).toBeTrue()
  })

  it("should send a list puzzles message to server when the user observes the end of the list", async () => {
    const ctx = testSpaceClientCtx()
    const output = await chainUpdates(initial, userObservedEndOfList(ctx))
    expect(
      didSendToServer(
        output,
        (msg) => msg.t === "flow-puzzle-list.list-puzzles",
      ),
    ).toBeTrue()
  })

  it("should record puzzles recieved from server", async () => {
    const ctx = testFlowClientCtx()
    const puzzle = FlowPuzzle.create({
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

    const output = await chainUpdates(
      initial,
      serverListedPuzzlesOk(ctx, [puzzle]),
    )

    expect(Object.values(output.model.puzzles)).not.toBeEmpty()
  })

  it("should show error when recieving list error fro server", async () => {
    const ctx = testFlowClientCtx()
    const error = "Something went wrong"
    const output = await chainUpdates(
      initial,
      serverListedPuzzlesErr(ctx, error),
    )
    expect(didShowErrorSm(output)).toBeTrue()
  })

  it("should show error after no server response", async () => {
    const ctx = testFlowClientCtx()
    const output = await chainUpdates(
      initial,
      userObservedEndOfList(ctx),
      elapsed(TimeSpan.fromMinutes(5)),
    )
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBeTrue()
  })
})
