import { describe, expect, it } from "bun:test"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock"
import { GameClientModule } from "../../../../@SHARED/architecture/game-client-v2"
import { EventId } from "../../../../@SHARED/event"
import { testSpaceClientCtx } from "../../@SHARED/testing/client"
import { FlowClient } from "./flow.client"
import { ModelClient } from "./flow.core"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"

const init = {
  model: FlowClient.init,
}

const ctx = testSpaceClientCtx

const useSelectedMode =
  (userId: UserId, mode: "builder" | "play" | null) => (model: ModelClient) => {
    return FlowClient.update({
      ctx,
      model,
      modelGame: {
        t: null,
      },
      msgSync: {
        t: "user-changed-mode",
        userId: userId,
        mode,
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
      },
    })
  }

describe("flow client", () => {
  it("should play a sound when selecting play mode", async () => {
    const output = await GameClientModule.chainUpdates(
      init,
      useSelectedMode(ctx.currentUserId, "play"),
    )
    expect(didPlaySound(output)).toBe(true)
  })

  it("should play a sound when selecting builder mode", async () => {
    const output = await GameClientModule.chainUpdates(
      init,
      useSelectedMode(ctx.currentUserId, "builder"),
    )
    expect(didPlaySound(output)).toBe(true)
  })

  it("should not play a sound when selecting no mode", async () => {
    const output = await GameClientModule.chainUpdates(
      init,
      useSelectedMode(ctx.currentUserId, null),
    )
    expect(didPlaySound(output)).toBe(true)
  })
})
