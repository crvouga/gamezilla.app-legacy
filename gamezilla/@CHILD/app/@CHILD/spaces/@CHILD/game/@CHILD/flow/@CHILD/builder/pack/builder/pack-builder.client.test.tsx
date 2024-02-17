import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { testSpaceClientCtx } from "../../../../../../@SHARED/testing/client"
import { ModelClient, initClient, initGame } from "../../builder.core"
import { PackBuilderClient } from "./pack-builder.client"

const ctx = { ...testSpaceClientCtx, onQuit() {}, puzzles: {} }
const modelGame = initGame({ ctx: testSpaceClientCtx })

const userClickedAddPuzzleButton = (model: ModelClient) => {
  return PackBuilderClient.update({
    model,
    msg: { t: "pack-builder.clicked-add-puzzle-button" },
    ctx,
    modelGame,
  })
}

const userClosedPuzzlePickerDrawer = (model: ModelClient) => {
  return PackBuilderClient.update({
    model,
    msg: { t: "pack-builder.closed-puzzle-picker-drawer" },
    ctx,
    modelGame,
  })
}

const initial = { model: initClient }

describe("pack builder client", () => {
  it("should open puzzle picker when user clicks add puzzle button", async () => {
    const output = await chainUpdates(initial, userClickedAddPuzzleButton)
    expect(output.model.packBuilderOpen === "puzzle-picker").toBeTrue()
  })

  it("should close puzzle picker when user clicks closes", async () => {
    const output = await chainUpdates(
      initial,
      userClickedAddPuzzleButton,
      userClosedPuzzlePickerDrawer,
    )
    expect(output.model.packBuilderOpen === null).toBeTrue()
  })
})
