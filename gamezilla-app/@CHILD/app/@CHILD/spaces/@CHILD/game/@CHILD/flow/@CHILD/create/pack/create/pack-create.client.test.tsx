import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { didPlaySound } from "gamezilla-app/@CHILD/app/@SHARED/client"
import { initClient } from "../../create.core"
import { clickedPackCreateButton } from "../../@TEST/client"

describe(import.meta.file, () => {
  it("should make a sound when the user clicks the create button", async () => {
    const output = await GameClientModule.chainUpdates(
      { model: initClient },
      clickedPackCreateButton,
    )

    expect(didPlaySound(output)).toBeTrue()
  })
})
