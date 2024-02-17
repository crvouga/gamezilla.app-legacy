import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { initial, observedEndOfPackList } from "../../testing/client-test"
import { isRequesting } from "gamezilla/@SHARED/core"

describe("pack list client", () => {
  //

  it("should list packs when user observers list", async () => {
    const output = await GameClientModule.chainUpdates(
      initial,
      observedEndOfPackList,
    )
    expect(isRequesting(output.model.packListRequest)).toBeTrue()
  })
})
