import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import {
  clickedExitPuzzleBuilderButton,
  clickedPuzzleListItem,
  createFlowPuzzle,
  initial,
  puzzleBuilderPressDownRandomNode,
  serverListedPuzzlesOk,
  testFlowClientCtx,
} from "../../@TEST/client"
import { deriveModelSync } from "../../@TEST/game"

const ctx = testFlowClientCtx()

describe(import.meta.file, () => {
  it("should open puzzle builder on list item click", async () => {
    const puzzle = createFlowPuzzle(ctx)
    const output = await GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk([puzzle]),
      clickedPuzzleListItem(puzzle),
    )
    const modelSync = deriveModelSync(output)
    expect(
      modelSync.opened.t === "puzzle-builder" &&
        modelSync.puzzleBuilder?.puzzle.id === puzzle.id,
    ).toBe(true)
  })

  it("should exit puzzle builder after clicking exit button", async () => {
    const puzzle = createFlowPuzzle(ctx)
    const openedBuilder = await GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk([puzzle]),
      clickedPuzzleListItem(puzzle),
    )

    const output = await GameClientModule.andThen(
      openedBuilder,
      clickedExitPuzzleBuilderButton(deriveModelSync(openedBuilder)),
    )

    const modelSync = deriveModelSync(output)

    expect(modelSync.opened.t === "list").toBe(true)
  })

  it("should open save prompt when exiting with unsaved changes", async () => {
    const puzzle = createFlowPuzzle(ctx)

    const openedBuilder = await GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk([puzzle]),
      clickedPuzzleListItem(puzzle),
    )

    const madeEdit = await GameClientModule.andThen(
      openedBuilder,
      puzzleBuilderPressDownRandomNode(deriveModelSync(openedBuilder)),
    )

    const output = await GameClientModule.andThen(
      madeEdit,
      clickedExitPuzzleBuilderButton(deriveModelSync(madeEdit)),
    )

    const modelSync = deriveModelSync(output)

    expect(
      modelSync.opened.t === "puzzle-builder" &&
        output.model.puzzleBuilderOpened === "unsaved-changes",
    ).toBe(true)
  })
})
