import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import {
  clickedOpenPuzzlePickerButton,
  clickedPuzzleGridItem,
  clickedPuzzlePickerItem,
  createFlowPack,
  createFlowPuzzle,
  initial,
  serverCreatedPack,
  testFlowClientCtx,
} from "../../../@TEST/client"
import { deriveModelSync } from "../../../@TEST/game"

describe(import.meta.file, () => {
  it.todo("should open puzzle when user clickes puzzle grid item", async () => {
    const ctx = testFlowClientCtx()
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
})
