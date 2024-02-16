import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { ModelClient, initClient, initGame } from "../../builder.core"
import { PackCreateClient } from "./pack-create.client"
import { spaceClientCtx } from "../../../../../../@SHARED/testing/client"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"

const userClickedCreateButton = (model: ModelClient) => {
  return PackCreateClient.update({
    model,
    msg: { t: "pack-create/user-clicked-create-button" },
    ctx: { ...spaceClientCtx, onQuit() {}, puzzles: {} },
    modelGame: initGame({ ctx: spaceClientCtx }),
  })
}

describe("flow pack create", () => {
  it("should make a sound when the user clicks the create button", () => {
    const output = GameClientModule.chainUpdates(
      { model: initClient },
      userClickedCreateButton,
    )

    expect(didPlaySound(output)).toBeTrue()
  })
})
