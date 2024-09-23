import { describe, expect, it } from 'bun:test'
import { LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import { didPlaySound } from 'gamezilla-app/app/@/client'
import type { UserId } from 'gamezilla-app/app/@/data'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { EventId } from '../../@/event'
import type { FlowClientCtx } from './@/flow-client-ctx'
import { testFlowClientCtx } from './builder/@/testing/client'
import { FlowClient } from './flow.client'
import { initCore } from './flow.core'
import type { ModelClient } from './flow.types'

const init = {
  model: FlowClient.init
}

const userSelectedMode =
  (ctx: FlowClientCtx, userId: UserId, mode: 'builder' | 'play' | null) => (model: ModelClient) => {
    return FlowClient.update({
      ctx,
      model,
      modelCore: initCore({ ctx }),
      msgCore: {
        t: 'user-changed-mode',
        userId: userId,
        mode,
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0)
      }
    })
  }

describe(import.meta.file, () => {
  it('should play a sound when selecting play mode', async () => {
    const ctx = await testFlowClientCtx()
    const output = GameClientModule.andThen(init, userSelectedMode(ctx, ctx.currentUserId, 'play'))
    expect(didPlaySound(output)).toBe(true)
  })

  it('should play a sound when selecting create mode', async () => {
    const ctx = await testFlowClientCtx()
    const output = GameClientModule.andThen(init, userSelectedMode(ctx, ctx.currentUserId, 'builder'))
    expect(didPlaySound(output)).toBe(true)
  })

  it('should not play a sound when selecting no mode', async () => {
    const ctx = await testFlowClientCtx()
    const output = GameClientModule.andThen(init, userSelectedMode(ctx, ctx.currentUserId, null))
    expect(didPlaySound(output)).toBe(true)
  })
})
