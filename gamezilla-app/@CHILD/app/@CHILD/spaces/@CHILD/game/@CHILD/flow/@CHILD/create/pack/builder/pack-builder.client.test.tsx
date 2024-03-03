import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { testSpaceClientCtx } from "../../../../../../@SHARED/testing/client"
import { FlowClientCtx } from "../../../../@SHARED/flow-ctx"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import {
  clickedExitPuzzleButton,
  clickedOpenPuzzlePickerButton,
  clickedPuzzleGridItem,
  clickedPuzzlePickerItem,
  closedPuzzlePickerDrawer,
  createFlowPack,
  createFlowPuzzle,
  defaultModelSync,
  initial,
  serverCreatedPack,
  testFlowClientCtx,
} from "../../@TEST/client"
import { deriveModelSync } from "../../@TEST/game"
import { ModelClient } from "../../create.core"
import { PackBuilderClient } from "./pack-builder.client"

describe(import.meta.file, () => {
  it("should open puzzle when user clickes puzzle grid item", async () => {
    const ctx = testSpaceClientCtx()
    const puzzle = createFlowPuzzle(ctx)

    const output = await andThen(
      initial,
      serverCreatedPack(createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(),
      clickedPuzzlePickerItem(puzzle),
      clickedPuzzleGridItem(puzzle, 0),
    )
    const modelSync = deriveModelSync(output)
    expect(
      modelSync.packBuilder?.screen.t === "screen-puzzle" &&
        modelSync.packBuilder.screen.puzzleIndex === 0,
    ).toBeTrue()
  })

  it("should open puzzle picker when user clicks add puzzle button", async () => {
    const ctx = testSpaceClientCtx()
    const output = await andThen(
      initial,
      serverCreatedPack(createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(),
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.screen.t === "add-puzzle").toBeTrue()
  })

  it("should close puzzle picker when user clicks closes", async () => {
    const ctx = testSpaceClientCtx()
    const output = await andThen(
      initial,
      serverCreatedPack(createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(),
      closedPuzzlePickerDrawer,
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBeTrue()
  })

  it("should add puzzle to the pack after clicking a puzzle in the picker", async () => {
    const ctx = testSpaceClientCtx()
    const puzzle = createFlowPuzzle(ctx)
    const output = await andThen(
      initial,
      serverCreatedPack(createFlowPack(ctx)),
      clickedPuzzlePickerItem(puzzle),
    )
    const modelSync = deriveModelSync(output)
    expect(
      modelSync.packBuilder &&
        FlowPack.includes(modelSync.packBuilder.pack, puzzle.id),
    ).toBeTrue()
  })

  it("should close puzzle picker after adding a puzzle to the pack", async () => {
    const ctx = testSpaceClientCtx()
    const puzzle = createFlowPuzzle(ctx)
    const output = await andThen(
      initial,
      serverCreatedPack(createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(),
      clickedPuzzlePickerItem(puzzle),
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBeTrue()
  })

  it("should go back to grid after exiting puzzle", async () => {
    const ctx = testSpaceClientCtx()
    const puzzle = createFlowPuzzle(ctx)
    const output = await andThen(
      initial,
      serverCreatedPack(createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(),
      clickedPuzzlePickerItem(puzzle),
      clickedPuzzleGridItem(puzzle, 0),
      clickedExitPuzzleButton(),
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBeTrue()
  })

  it('should open the more drawer after clicking "more" button', async () => {
    const ctx = testFlowClientCtx()
    const puzzle = createFlowPuzzle(ctx)
    const output = await andThen(
      initial,
      serverCreatedPack(createFlowPack(ctx)),
      clickedOpenPuzzlePickerButton(),
      clickedPuzzlePickerItem(puzzle),
      clickedPuzzleGridItem(puzzle, 0),
      clickedMoreButton(ctx),
    )
    const modelSync = deriveModelSync(output)
    expect(
      modelSync.packBuilder?.screen.t === "screen-puzzle" &&
        modelSync.packBuilder?.screen.opened === "more",
    ).toBeTrue()
  })
})

const clickedMoreButton = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return PackBuilderClient.update({
    ctx,
    model,
    modelSync: defaultModelSync,
    msg: {
      t: "pack-builder.puzzle-screen.user-clicked-more-button",
      userId: ctx.currentUserId,
    },
  })
}
