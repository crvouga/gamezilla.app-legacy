import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { didSendToServer } from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  Err,
  Ok,
  Posix,
  RequestResponse,
  TimeSpan,
} from "gamezilla-app/@SHARED/core"
import { FlowVariant, FlowVariantDimensions } from "../../../../@SHARED/flow"
import { FlowPack } from "../../../../@SHARED/flow-pack"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle"
import {
  defaultModelSync,
  testFlowClientCtx,
} from "../../@SHARED/testing/client"
import { RemovePuzzleClient } from "./remove-puzzle.client"
import {
  ModelClient,
  RemovePuzzleClientCtx,
  initClient,
} from "./remove-puzzle.core"

const initial = (ctx: RemovePuzzleClientCtx) => {
  return {
    model: initClient({
      [ctx.pack.id]: ctx.pack,
    }),
  }
}

const clickedRemovePuzzleButton =
  (ctx: RemovePuzzleClientCtx) => (model: ModelClient) => {
    return RemovePuzzleClient.update({
      ctx,
      model,
      modelSync: defaultModelSync,
      msg: {
        t: "remove-puzzle.clicked-remove-from-pack-button",
      },
    })
  }

const serverRemovedPuzzleOk =
  (ctx: RemovePuzzleClientCtx) => (model: ModelClient) => {
    return RemovePuzzleClient.update({
      ctx,
      model,
      modelSync: defaultModelSync,
      msgServer: {
        t: "remove-puzzle.removed",
        result: Ok(null),
        packId: ctx.pack.id,
        packPuzzleIndex: 0,
        puzzleId: ctx.puzzle.id,
      },
    })
  }

const serverRemovedPuzzleErr =
  (ctx: RemovePuzzleClientCtx) => (model: ModelClient) => {
    return RemovePuzzleClient.update({
      ctx,
      model,
      modelSync: defaultModelSync,
      msgServer: {
        t: "remove-puzzle.removed",
        result: Err("error"),
        packId: ctx.pack.id,
        packPuzzleIndex: 0,
        puzzleId: ctx.puzzle.id,
      },
    })
  }

const timePassed = (ctx: RemovePuzzleClientCtx) => (model: ModelClient) => {
  return RemovePuzzleClient.update({
    ctx,
    model,
    modelSync: defaultModelSync,
    msg: {
      t: "remove-puzzle.time-passed",
    },
  })
}

const testRemovePuzzleCtx = (): RemovePuzzleClientCtx => {
  const ctx = testFlowClientCtx()
  const puzzle = FlowPuzzle.create({
    count: 1,
    createdAt: ctx.now,
    createdBy: ctx.currentUserId,
    flow: FlowVariant.init({
      terminalsByGroupId: {},
      dimensions: FlowVariantDimensions.init({
        t: "flow-grid",
        height: 5,
        width: 5,
      }),
    }),
  })

  const pack = FlowPack.create({
    createdBy: ctx.currentUserId,
    now: ctx.now,
    puzzleIds: [puzzle.id],
  })

  return {
    ...ctx,
    currentUserId: pack.createdBy,
    pack,
    puzzle,
    packPuzzleIndex: pack.puzzleIds.indexOf(puzzle.id),
  }
}

describe(import.meta.file, () => {
  it("should be loading after clicking remove puzzle button", async () => {
    const ctx = testRemovePuzzleCtx()

    const output = andThen(initial(ctx), clickedRemovePuzzleButton(ctx))

    expect(output.model.removePuzzleRequest.t === "loading").toBe(true)
  })

  it("should send message to server after clicking remove puzzle button", async () => {
    const ctx = testRemovePuzzleCtx()

    const output = andThen(initial(ctx), clickedRemovePuzzleButton(ctx))

    expect(
      didSendToServer(
        output,
        (msg) => msg.t === "remove-puzzle.clicked-remove-from-pack-button",
      ),
    ).toBe(true)
  })

  it("should time out after a while after no response", async () => {
    const ctx = testRemovePuzzleCtx()

    const output = andThen(
      initial(ctx),
      clickedRemovePuzzleButton(ctx),
      timePassed({ ...ctx, now: Posix.add(ctx.now, TimeSpan.fromMinutes(1)) }),
    )

    expect(
      RequestResponse.didRequestTimeout(output.model.removePuzzleRequest),
    ).toBe(true)
  })

  it("should be ok after server responds with ok", async () => {
    const ctx = testRemovePuzzleCtx()
    const output = andThen(
      initial(ctx),
      clickedRemovePuzzleButton(ctx),
      serverRemovedPuzzleOk(ctx),
    )
    expect(RequestResponse.isOk(output.model.removePuzzleRequest)).toBe(true)
  })

  it("should be error after server responds with error", async () => {
    const ctx = testRemovePuzzleCtx()
    const output = andThen(
      initial(ctx),
      clickedRemovePuzzleButton(ctx),
      serverRemovedPuzzleErr(ctx),
    )
    expect(RequestResponse.isErr(output.model.removePuzzleRequest)).toBe(true)
  })

  it("should remove puzzle from pack after server responds with ok", async () => {
    const ctx = testRemovePuzzleCtx()
    const output = andThen(
      initial(ctx),
      clickedRemovePuzzleButton(ctx),
      serverRemovedPuzzleOk(ctx),
    )
    const pack = output.model.packs[ctx.pack.id]
    expect(pack?.puzzleIds.includes(ctx.puzzle.id)).toBe(false)
  })
})
