import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  didSendToServer,
  didShowErrorSm,
} from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Posix,
  RequestResponse,
  TimeSpan,
  err,
  isRequesting,
  ok,
} from "gamezilla/@SHARED/core"
import { testSpaceClientCtx } from "../../../../@SHARED/testing/client"
import { testFlowClientCtx } from "../../@CHILD/create/@TEST/client"
import { FlowVariant, FlowVariantDimensions } from "../flow"
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle"
import { FlowPuzzleListClient } from "./flow-puzzle-list.client"
import { ModelClient, initClient } from "./flow-puzzle-list.core"

const initial = {
  model: initClient,
}

const userObservedEndOfList = (model: ModelClient) => {
  return FlowPuzzleListClient.update({
    ctx: testSpaceClientCtx,
    model,
    msg: {
      t: "flow-puzzle-list.user-observed-end-of-list",
    },
  })
}

const serverListedPuzzlesOk =
  (puzzles: FlowPuzzle[]) => (model: ModelClient) => {
    return FlowPuzzleListClient.update({
      ctx: testSpaceClientCtx,
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

const serverListedPuzzlesErr = (error: string) => (model: ModelClient) => {
  return FlowPuzzleListClient.update({
    ctx: testSpaceClientCtx,
    model,
    msgServer: {
      t: "flow-puzzle-list.listed-puzzle",
      listed: err(error),
    },
  })
}

const elapsed = (timeSpan: TimeSpan) => (model: ModelClient) => {
  return FlowPuzzleListClient.update({
    ctx: {
      ...testSpaceClientCtx,
      now: Posix.add(testSpaceClientCtx.now, timeSpan),
    },
    model,
    msg: { t: "flow-puzzle-list.elasped" },
  })
}

describe(import.meta.file, () => {
  it("should it be requesting when the user observes the end of the list", async () => {
    const output = await chainUpdates(initial, userObservedEndOfList)
    expect(isRequesting(output.model.request)).toBeTrue()
  })

  it("should send a list puzzles message to server when the user observes the end of the list", async () => {
    const output = await chainUpdates(initial, userObservedEndOfList)
    expect(
      didSendToServer(
        output,
        (msg) => msg.t === "flow-puzzle-list.list-puzzles",
      ),
    ).toBeTrue()
  })

  it("should record puzzles recieved from server", async () => {
    const puzzle = FlowPuzzle.create({
      count: 1,
      createdAt: testFlowClientCtx.now,
      createdBy: testFlowClientCtx.currentUserId,
      flow: FlowVariant.init({
        dimensions: FlowVariantDimensions.init({
          t: "flow-grid",
          height: 5,
          width: 5,
        }),
        terminalsByGroupId: {},
      }),
    })

    const output = await chainUpdates(initial, serverListedPuzzlesOk([puzzle]))

    expect(Object.values(output.model.puzzles)).not.toBeEmpty()
  })

  it("should show error when recieving list error fro server", async () => {
    const error = "Something went wrong"
    const output = await chainUpdates(initial, serverListedPuzzlesErr(error))
    expect(didShowErrorSm(output)).toBeTrue()
  })

  it("should show error after no server response", async () => {
    const output = await chainUpdates(
      initial,
      userObservedEndOfList,
      elapsed(TimeSpan.fromSeconds(10)),
    )
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBeTrue()
  })
})
