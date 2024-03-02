import { describe, expect, it } from "test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"
import {
  clickedPackItem,
  createFlowPack,
  initial,
  testFlowClientCtx,
} from "../../@TEST/client"
import { deriveModelSync } from "../../@TEST/game"

const ctx = testFlowClientCtx()

describe(import.meta.file, () => {
  //

  it("should open pack builder when clicked pack list item", async () => {
    const pack = createFlowPack(ctx)
    const output = await chainUpdates(initial, clickedPackItem(pack))
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.pack.id === pack.id).toBeTrue()
  })

  it("should play sound when clicked pack list item", async () => {
    const pack = createFlowPack(ctx)
    const output = await chainUpdates(initial, clickedPackItem(pack))
    expect(didPlaySound(output)).toBeTrue()
  })
})
