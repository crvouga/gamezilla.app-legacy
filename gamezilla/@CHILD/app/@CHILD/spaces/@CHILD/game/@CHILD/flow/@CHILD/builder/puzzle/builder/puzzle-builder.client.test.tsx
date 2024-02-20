import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
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

describe("flow puzzle builder client", () => {
  it("should open puzzle builder on list item click", async () => {
    const puzzle = createFlowPuzzle(testFlowClientCtx)
    const output = await GameClientModule.chainUpdates(
      initial,
      serverListedPuzzlesOk([puzzle]),
      clickedPuzzleListItem(puzzle),
    )
    const modelSync = deriveModelSync(output)
    expect(
      modelSync.opened.t === "puzzle-builder" &&
        modelSync.puzzleBuilder?.puzzle.id === puzzle.id,
    ).toBeTrue()
  })

  it("should exit puzzle builder after clicking exit button", async () => {
    const puzzle = createFlowPuzzle(testFlowClientCtx)
    const openedBuilder = await GameClientModule.chainUpdates(
      initial,
      serverListedPuzzlesOk([puzzle]),
      clickedPuzzleListItem(puzzle),
    )

    const output = await GameClientModule.chainUpdates(
      openedBuilder,
      clickedExitPuzzleBuilderButton(deriveModelSync(openedBuilder)),
    )

    const modelSync = deriveModelSync(output)

    expect(modelSync.opened.t === "list").toBeTrue()
  })

  it("should open save prompt when exiting with unsaved changes", async () => {
    const puzzle = createFlowPuzzle(testFlowClientCtx)

    const openedBuilder = await GameClientModule.chainUpdates(
      initial,
      serverListedPuzzlesOk([puzzle]),
      clickedPuzzleListItem(puzzle),
    )

    const madeEdit = await GameClientModule.chainUpdates(
      openedBuilder,
      puzzleBuilderPressDownRandomNode(deriveModelSync(openedBuilder)),
    )

    const output = await GameClientModule.chainUpdates(
      madeEdit,
      clickedExitPuzzleBuilderButton(deriveModelSync(madeEdit)),
    )

    const modelSync = deriveModelSync(output)

    expect(
      modelSync.opened.t === "puzzle-builder" &&
        output.model.puzzleBuilderOpened === "unsaved-changes",
    ).toBeTrue()
  })
})
