import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { didPlaySound } from "gamezilla-app/@CHILD/app/@SHARED/client"
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
    const output = await andThen(initial, clickedPackItem(pack))
    const modelSync = deriveModelSync(output)
    expect(modelSync.packBuilder?.pack.id === pack.id).toBe(true)
  })

  it("should play sound when clicked pack list item", async () => {
    const pack = createFlowPack(ctx)
    const output = await andThen(initial, clickedPackItem(pack))
    expect(didPlaySound(output)).toBe(true)
  })
})
