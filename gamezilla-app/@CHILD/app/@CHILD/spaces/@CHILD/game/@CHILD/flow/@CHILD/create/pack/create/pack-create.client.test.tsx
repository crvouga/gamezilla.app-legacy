import { describe, expect, it } from "bun:test"
import { GameClientModule } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import {
  didPlaySound,
  didShowToast,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  clickedPackCreateButton,
  createFlowPack,
  testFlowClientCtx,
  userCreatedPack,
} from "../../@TEST/client"
import { initClient } from "../../create.core"

describe(import.meta.file, () => {
  it("should make a sound when the user clicks the create button", async () => {
    const output = await GameClientModule.andThen(
      { model: initClient },
      clickedPackCreateButton,
    )

    expect(didPlaySound(output)).toBeTrue()
  })

  it("should play a sound after user created a pack", async () => {
    const pack = createFlowPack(testFlowClientCtx())
    const output = await GameClientModule.andThen(
      { model: initClient },
      userCreatedPack(pack),
    )

    expect(didPlaySound(output)).toBeTrue()
  })

  it("should show toast after server created current users pack", async () => {
    const pack = createFlowPack(testFlowClientCtx())
    const output = await GameClientModule.andThen(
      { model: initClient },
      userCreatedPack(pack),
    )
    expect(didShowToast(output)).toBeTrue()
  })
})
