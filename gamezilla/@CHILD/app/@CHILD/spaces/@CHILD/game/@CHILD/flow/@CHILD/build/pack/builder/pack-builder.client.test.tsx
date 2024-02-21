import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { didSendToServer } from "gamezilla/@CHILD/app/@SHARED/client"
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
  serverListedPuzzlesByIdOk,
} from "../../@TEST/client"
import { deriveModelSync } from "../../@TEST/game"

describe(import.meta.file, () => {
  it("should open puzzle when user clickes puzzle grid item", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)

    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton(),
      clickedPuzzlePickerItem(puzzle),
      clickedPuzzleGridItem(puzzle, 0),
    )
    const modelSync = deriveModelSync(output)
    expect(
      modelSync.packBuilder?.screen.t === "puzzle" &&
        modelSync.packBuilder.screen.puzzleIndex === 0,
    ).toBeTrue()
  })

  it("should open puzzle picker when user clicks add puzzle button", async () => {
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton(),
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.opened.t === "add-puzzle").toBeTrue()
  })

  it("should close puzzle picker when user clicks closes", async () => {
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton(),
      closedPuzzlePickerDrawer,
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.screen.t === "pack").toBeTrue()
  })

  it("should add puzzle to the pack after clicking a puzzle in the picker", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedPuzzlePickerItem(puzzle),
    )
    const modelSync = deriveModelSync(output)
    expect(
      modelSync.packBuilder &&
        FlowPack.includes(modelSync.packBuilder.pack, puzzle.id),
    ).toBeTrue()
  })

  it("should close puzzle picker after adding a puzzle to the pack", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton(),
      clickedPuzzlePickerItem(puzzle),
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.screen.t === "pack").toBeTrue()
  })

  it("should go back to grid after exiting puzzle", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const output = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx)),
      clickedOpenPuzzlePickerButton(),
      clickedPuzzlePickerItem(puzzle),
      clickedPuzzleGridItem(puzzle, 0),
      clickedExitPuzzleButton(),
    )
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.screen.t === "pack").toBeTrue()
  })

  it("should request missing puzzles from the server", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const openedPackBuilder = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx, [puzzle.id])),
    )

    const output = await chainUpdates(
      openedPackBuilder,
      clickedOpenPuzzlePickerButton(deriveModelSync(openedPackBuilder)),
    )

    expect(
      didSendToServer(
        output,
        (msg) =>
          msg.t === "pack-builder.list-puzzles-by-id" &&
          msg.puzzleIds.includes(puzzle.id),
      ),
    ).toBeTrue()
  })

  it("should record puzzles sent back from server", async () => {
    const puzzle = createFlowPuzzle(testSpaceClientCtx)
    const openedPackBuilder = await chainUpdates(
      initial,
      serverCreatedPack(createFlowPack(testSpaceClientCtx, [puzzle.id])),
    )

    const output = await chainUpdates(
      openedPackBuilder,
      clickedOpenPuzzlePickerButton(deriveModelSync(openedPackBuilder)),
      serverListedPuzzlesByIdOk([puzzle]),
    )

    expect(output.model.puzzles[puzzle.id]?.id === puzzle.id).toBeTrue()
  })
})
