import { describe, expect, it } from "bun:test"
import { SpaceClientCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  didSendToServer,
  didShowErrorSm,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Posix, RequestResponse, TimeSpan } from "gamezilla-app/@SHARED/core"
import { FlowPack } from ".."
import { testFlowClientCtx } from "../../../@CHILD/create/@TEST/client"
import { FlowVariant, FlowVariantDimensions } from "../../flow"
import { FlowPuzzle } from "../../flow-puzzle"
import { FlowPackPuzzleGridClient } from "./flow-pack-puzzle-grid.client"
import { ModelClient, initClient } from "./flow-pack-puzzle-grid.core"

const initial = (_pack: FlowPack) => {
  return {
    model: initClient,
  }
}

const userObversedGrid = (ctx: SpaceClientCtx) => (model: ModelClient) => {
  return FlowPackPuzzleGridClient.update({
    ctx,
    model,
    msg: {
      t: "user-observed-grid",
    },
  })
}

const serverListedPuzzlesByIdErr =
  (ctx: SpaceClientCtx, error: string) => (model: ModelClient) => {
    return FlowPackPuzzleGridClient.update({
      ctx,
      model,
      msgServer: {
        t: "listed-puzzles-by-id",
        listed: {
          t: "err",
          error,
        },
      },
    })
  }

const serverListedPuzzlesByIdOk =
  (ctx: SpaceClientCtx, puzzles: FlowPuzzle[]) => (model: ModelClient) => {
    return FlowPackPuzzleGridClient.update({
      ctx,
      model,
      msgServer: {
        t: "listed-puzzles-by-id",
        listed: {
          t: "ok",
          value: {
            items: puzzles,
            limit: puzzles.length,
            offset: 0,
            total: puzzles.length,
          },
        },
      },
    })
  }

const elapsed =
  (ctx: SpaceClientCtx, timeSpan: TimeSpan) => (model: ModelClient) => {
    return FlowPackPuzzleGridClient.update({
      ctx: { ...ctx, now: Posix.add(ctx.now, timeSpan) },
      model,
      msg: { t: "elapsed" },
    })
  }

const setup = (ctx: SpaceClientCtx) => {
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
  const pack = FlowPack.create({
    createdBy: ctx.currentUserId,
    now: ctx.now,
    puzzleIds: [puzzle.id],
  })
  return {
    pack,
    puzzle,
    ctx: {
      ...ctx,
      pack,
    },
  }
}

const isSubset = <T,>(subArray: T[], superArray: T[]): boolean => {
  return subArray.every((item) => superArray.includes(item))
}

const hasSameElements = <T,>(a: T[], b: T[]): boolean => {
  return isSubset(a, b) && isSubset(b, a)
}

describe(import.meta.file, () => {
  it("should send a request to list puzzles when grid is visible", async () => {
    const { pack, ctx } = setup(testFlowClientCtx())
    const output = await AppClientModule.andThen(
      initial(pack),
      userObversedGrid(ctx),
    )

    expect(
      didSendToServer(output, (msg) => msg.t === "list-puzzles-by-id"),
    ).toBe(true)
  })

  it("should have missing puzzle ids in list request", async () => {
    const { pack, ctx } = setup(testFlowClientCtx())
    const output = await AppClientModule.andThen(
      initial(pack),
      userObversedGrid(ctx),
    )

    expect(
      didSendToServer(
        output,
        (msg) =>
          msg.t === "list-puzzles-by-id" &&
          hasSameElements(msg.puzzleIds, pack.puzzleIds),
      ),
    ).toBe(true)
  })

  it("should record puzzles listed by server", async () => {
    const { pack, ctx, puzzle } = setup(testFlowClientCtx())
    const output = await AppClientModule.andThen(
      initial(pack),
      serverListedPuzzlesByIdOk(ctx, [puzzle]),
    )
    expect(output.model.puzzles[puzzle.id]).toEqual(puzzle)
  })

  it("should show an error when server sends an error while listing puzzles", async () => {
    const { pack, ctx } = setup(testFlowClientCtx())
    const error = "Something went wrong"
    const output = await AppClientModule.andThen(
      initial(pack),
      serverListedPuzzlesByIdErr(ctx, error),
    )
    expect(didShowErrorSm(output, error)).toBe(true)
  })

  it("should in a loading state after requesting to list puzzles", async () => {
    const { pack, ctx } = setup(testFlowClientCtx())
    const output = await AppClientModule.andThen(
      initial(pack),
      userObversedGrid(ctx),
    )
    expect(RequestResponse.isRequesting(output.model.request)).toBe(true)
  })

  it("should in an ok state after server listed puzzles", async () => {
    const { puzzle, pack, ctx } = setup(testFlowClientCtx())
    const output = await AppClientModule.andThen(
      initial(pack),
      userObversedGrid(ctx),
      serverListedPuzzlesByIdOk(ctx, [puzzle]),
    )
    expect(RequestResponse.isOk(output.model.request)).toBe(true)
  })

  it("should timeout request after too much time", async () => {
    const { pack, ctx } = setup(testFlowClientCtx())
    const output = await AppClientModule.andThen(
      initial(pack),
      userObversedGrid(ctx),
      elapsed(ctx, TimeSpan.fromMinutes(5)),
    )
    expect(RequestResponse.isTimedOut(output.model.request)).toBe(true)
  })
})
