import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { testSpaceClientCtx } from "../../../../../../@SHARED/testing/client"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
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
} from "../../@TEST/client"
import { deriveModelGame } from "../../@TEST/game"

describe("pack builder client", () => {
  it("should open puzzle when user clickes puzzle grid item", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)

    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton,
      clickedPuzzlePickerItem(puzzle),
      clickedPuzzleGridItem(puzzle, 0),
    )
    const modelGame = deriveModelGame(output)
    expect(
      modelGame.packBuilder?.opened.t === "puzzle" &&
        modelGame.packBuilder.opened.puzzleIndex === 0,
    ).toBeTrue()
  })

  it("should open puzzle picker when user clicks add puzzle button", async () => {
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton,
    )
    const modelGame = deriveModelGame(output)
    expect(modelGame.packBuilder?.opened.t === "add-puzzle").toBeTrue()
  })

  it("should close puzzle picker when user clicks closes", async () => {
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton,
      closedPuzzlePickerDrawer,
    )
    const modelGame = deriveModelGame(output)
    expect(modelGame.packBuilder?.opened.t === "pack").toBeTrue()
  })

  it("should add puzzle to the pack after clicking a puzzle in the picker", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedPuzzlePickerItem(puzzle),
    )
    const modelGame = deriveModelGame(output)
    expect(
      modelGame.packBuilder &&
        FlowPack.includes(modelGame.packBuilder.pack, puzzle.id),
    ).toBeTrue()
  })

  it("should close puzzle picker after adding a puzzle to the pack", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton,
      clickedPuzzlePickerItem(puzzle),
    )
    const modelGame = deriveModelGame(output)
    expect(modelGame.packBuilder?.opened.t === "pack").toBeTrue()
  })

  it("should go back to grid after exiting puzzle", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton,
      clickedPuzzlePickerItem(puzzle),
      clickedPuzzleGridItem(puzzle, 0),
      clickedExitPuzzleButton(),
    )
    const modelGame = deriveModelGame(output)
    expect(modelGame.packBuilder?.opened.t === "pack").toBeTrue()
  })
})
