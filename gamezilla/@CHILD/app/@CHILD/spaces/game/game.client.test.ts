import { describe, expect, test } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  userInputtedGame,
  init,
  clickedStartSpaceButton,
  ctx,
} from "../@TEST/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"

describe("game client", () => {
  test("should play a sound after inputting a game", async () => {
    const spaceId = SpaceId.generate()
    const started = await AppClientModule.chainUpdates(await init(), (model) =>
      clickedStartSpaceButton(model, spaceId),
    )
    const output = await AppClientModule.chainUpdates(
      { model: started.model },
      (model) =>
        userInputtedGame(model, ctx.currentUserId, spaceId, "connect-four"),
    )
    expect(didPlaySound(output)).toBeTrue()
  })
})
