import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { clickedPackItem, initial, testFlowClientCtx } from "../../@TEST/client"
import { deriveModelGame } from "../../@TEST/game"

describe("pack list client", () => {
  //

  it("should open pack builder when clicked pack list item", async () => {
    const pack = FlowPack.create({
      createdBy: testFlowClientCtx.currentUserId,
      now: testFlowClientCtx.now,
      puzzleIds: [],
    })

    const output = await chainUpdates(initial, clickedPackItem(pack))

    const modelGame = deriveModelGame(output)

    expect(modelGame.packBuilder?.pack.id === pack.id).toBeTrue()
  })
})
