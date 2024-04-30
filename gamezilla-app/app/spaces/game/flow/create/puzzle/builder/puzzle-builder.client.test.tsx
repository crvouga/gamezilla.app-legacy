import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla-app/app/spaces/@shared/architecture/game-client-v2"
import {
  clickedExitPuzzleBuilderButton,
  clickedPuzzleListItem,
  createFlowPuzzle,
  initial,
  puzzleBuilderPressDownRandomNode,
  serverListedPuzzlesOk,
  testFlowClientCtx,
} from "../../@SHARED/testing/client"
import { deriveModelSync } from "../../@SHARED/testing/game"

describe(import.meta.file, () => {
  it("should open puzzle builder on list item click", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const output = GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk(ctx, [puzzle]),
      clickedPuzzleListItem(ctx, puzzle),
    )
    const modelSync = deriveModelSync(ctx)(output)
    expect(
      modelSync.opened.t === "puzzle-builder" &&
        modelSync.puzzleBuilder?.puzzle.id === puzzle.id,
    ).toBe(true)
  })

  it("should exit puzzle builder after clicking exit button", async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const openedBuilder = GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk(ctx, [puzzle]),
      clickedPuzzleListItem(ctx, puzzle),
    )

    const output = GameClientModule.andThen(
      openedBuilder,
      clickedExitPuzzleBuilderButton(ctx, deriveModelSync(ctx)(openedBuilder)),
    )

    const modelSync = deriveModelSync(ctx)(output)

    expect(modelSync.opened.t === "list").toBe(true)
  })

  it("should open save prompt when exiting with unsaved changes", async () => {
    const ctx = await testFlowClientCtx()

    const puzzle = await createFlowPuzzle(ctx)

    const openedBuilder = GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk(ctx, [puzzle]),
      clickedPuzzleListItem(ctx, puzzle),
    )

    const madeEdit = GameClientModule.andThen(
      openedBuilder,
      puzzleBuilderPressDownRandomNode(
        ctx,
        deriveModelSync(ctx)(openedBuilder),
      ),
    )

    const output = GameClientModule.andThen(
      madeEdit,
      clickedExitPuzzleBuilderButton(ctx, deriveModelSync(ctx)(madeEdit)),
    )

    const modelSync = deriveModelSync(ctx)(output)

    expect(
      modelSync.opened.t === "puzzle-builder" &&
        output.model.puzzleBuilderOpened === "unsaved-changes",
    ).toBe(true)
  })
})
