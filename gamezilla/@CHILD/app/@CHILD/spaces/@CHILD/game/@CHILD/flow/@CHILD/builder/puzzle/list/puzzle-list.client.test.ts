import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import {
  modelSync,
  initial,
  testFlowClientCtx,
  createFlowPuzzle,
} from "../../@TEST/client"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { BuilderClient } from "../../builder.client"
import { ModelClient } from "../../builder.core"
import { deriveModelSync } from "../../@TEST/game"

const clickedPuzzleListItem = (puzzle: FlowPuzzle) => (model: ModelClient) => {
  return BuilderClient.update({
    ctx: testFlowClientCtx,
    model,
    modelSync: modelSync,
    msg: {
      t: "puzzle-list.clicked-puzzle-list-item",
      puzzle,
    },
  })
}

describe("puzzle list client", () => {
  it("should open puzzle builder after clicking a puzzle in the list", async () => {
    const puzzle = createFlowPuzzle(testFlowClientCtx)

    const output = await chainUpdates(
      initial,
      clickedPuzzleListItem(puzzle),
      //
    )

    const modelSync = deriveModelSync(output)

    expect(
      modelSync.opened.t === "puzzle-builder" &&
        modelSync.puzzleBuilder?.puzzle.id === puzzle.id,
    ).toBeTrue()
  })
})
