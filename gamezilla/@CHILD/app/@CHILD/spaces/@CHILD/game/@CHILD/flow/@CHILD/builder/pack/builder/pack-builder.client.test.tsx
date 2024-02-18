import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { testSpaceClientCtx } from "../../../../../../@SHARED/testing/client"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import {
  clickedAddPuzzleButton,
  clickedPuzzlePickerItem,
  closedPuzzlePickerDrawer,
  createFlowPack,
  createFlowPuzzle,
  initial,
  serverCreatedPack,
} from "../../@TEST/client"
import { deriveModelGame } from "../../@TEST/game"

describe("pack builder client", () => {
  it("should open puzzle picker when user clicks add puzzle button", async () => {
    const output = await chainUpdates(initial, clickedAddPuzzleButton)
    expect(output.model.packBuilderOpen === "puzzle-picker").toBeTrue()
  })

  it("should close puzzle picker when user clicks closes", async () => {
    const output = await chainUpdates(
      initial,
      clickedAddPuzzleButton,
      closedPuzzlePickerDrawer,
    )
    expect(output.model.packBuilderOpen === null).toBeTrue()
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
      modelGame.t === "pack-builder" &&
        FlowPack.includes(modelGame.pack, puzzle.id),
    ).toBeTrue()
  })

  it("should close puzzle picker after adding a puzzle to the pack", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const output = await chainUpdates(
      initial,
      clickedAddPuzzleButton,
      clickedPuzzlePickerItem(puzzle),
    )
    expect(output.model.packBuilderOpen === null).toBeTrue()
  })
})
