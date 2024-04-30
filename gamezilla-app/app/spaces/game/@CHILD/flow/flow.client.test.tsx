import { describe, expect, it } from "bun:test"
import { didPlaySound } from "gamezilla-app/app/@SHARED/client"
import { UserId } from "gamezilla-app/app/@SHARED/data"
import { LamportTimestamp } from "gamezilla-app/@SHARED/lamport-clock"
import { GameClientModule } from "../../../@SHARED/architecture/game-client-v2"
import { EventId } from "../../../@SHARED/event"
import { FlowClientCtx } from "./@SHARED/flow-ctx"
import { FlowClient } from "./flow.client"
import { ModelClient } from "./flow.core"
import { testFlowClientCtx } from "./@CHILD/create/@SHARED/testing/client"

const init = {
  model: FlowClient.init,
}

const userSelectedMode =
  (ctx: FlowClientCtx, userId: UserId, mode: "create" | "play" | null) =>
  (model: ModelClient) => {
    return FlowClient.update({
      ctx,
      model,
      modelSync: {
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

describe(import.meta.file, () => {
  it("should play a sound when selecting play mode", async () => {
    const ctx = await testFlowClientCtx()
    const output = GameClientModule.andThen(
      init,
      userSelectedMode(ctx, ctx.currentUserId, "play"),
    )
    expect(didPlaySound(output)).toBe(true)
  })

  it("should play a sound when selecting create mode", async () => {
    const ctx = await testFlowClientCtx()
    const output = GameClientModule.andThen(
      init,
      userSelectedMode(ctx, ctx.currentUserId, "create"),
    )
    expect(didPlaySound(output)).toBe(true)
  })

  it("should not play a sound when selecting no mode", async () => {
    const ctx = await testFlowClientCtx()
    const output = GameClientModule.andThen(
      init,
      userSelectedMode(ctx, ctx.currentUserId, null),
    )
    expect(didPlaySound(output)).toBe(true)
  })
})
