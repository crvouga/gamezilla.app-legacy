import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/app/spaces/@shared/architecture/game-client-v2"
import type { FlowClientCtx } from "../../../@shared/flow-ctx"
import { FlowPack } from "../../../@shared/flow-pack/flow-pack"
import { deriveModelSync } from "../../@shared/testing/game"
import type { ModelClient } from "../../create.core"
import { PackBuilderClient } from "./pack-builder.client"
import {
  clickedExitPuzzleButton,
  clickedOpenPuzzlePickerButton,
  clickedPuzzleGridItem,
  clickedPuzzlePickerItem,
  closedPuzzlePickerDrawer,
  createFlowPack,
  createFlowPuzzle,
  initial,
  serverCreatedPack,
  testFlowClientCtx,
} from "../../@shared/testing/client"
import { initSync } from "../../create.sync"

const clickedMoreButton = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return PackBuilderClient.update({
    ctx,
    model,
    modelSync: initSync({ ctx }),
    msg: {
      t: "pack-builder.puzzle-screen.user-clicked-more-button",
      userId: ctx.currentUserId,
    },
  })
}

const closedMoreDrawer = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return PackBuilderClient.update({
    ctx,
    model,
    modelSync: initSync({ ctx }),
    msg: {
      t: "pack-builder.puzzle-screen.user-closed-more-drawer",
      userId: ctx.currentUserId,
    },
  })
}

describe(import.meta.file, () => {
  it("should open puzzle when user clickes puzzle grid item", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)

    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(
      modelSync.packBuilder?.screen.t === "screen-puzzle" &&
        modelSync.packBuilder.screen.puzzleIndex === 0,
    ).toBe(true)
  })

  it("should open puzzle picker when user clicks add puzzle button", async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(modelSync.packBuilder?.screen.t === "add-puzzle").toBe(true)
  })

  it("should close puzzle picker when user clicks closes", async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      closedPuzzlePickerDrawer(ctx),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true)
  })

  it("should add puzzle to the pack after clicking a puzzle in the picker", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedPuzzlePickerItem(ctx, puzzle),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(
      modelSync.packBuilder &&
        FlowPack.includes(modelSync.packBuilder.pack, puzzle.id),
    ).toBe(true)
  })

  it("should close puzzle picker after adding a puzzle to the pack", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true)
  })

  it("should go back to grid after exiting puzzle", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
      clickedExitPuzzleButton(ctx),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true)
  })

  it('should open the more drawer after clicking "more" button', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
      clickedMoreButton(ctx),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(
      modelSync.packBuilder?.screen.t === "screen-puzzle" &&
        modelSync.packBuilder?.screen.opened === "more",
    ).toBe(true)
  })

  it("should close the more drawer", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
      clickedMoreButton(ctx),
      closedMoreDrawer(ctx),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(
      modelSync.packBuilder?.screen.t === "screen-puzzle" &&
        modelSync.packBuilder?.screen.opened === null,
    ).toBe(true)
  })
})
