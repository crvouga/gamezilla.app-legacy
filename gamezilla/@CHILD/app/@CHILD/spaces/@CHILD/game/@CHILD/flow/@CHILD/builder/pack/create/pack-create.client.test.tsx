import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"
import { initClient } from "../../builder.core"
import { clickedPackCreateButton } from "../../@TEST/client"

describe("flow pack create", () => {
  it("should make a sound when the user clicks the create button", async () => {
    const output = await GameClientModule.chainUpdates(
      { model: initClient },
      clickedPackCreateButton,
    )

    expect(didPlaySound(output)).toBeTrue()
  })
})
