import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/client/cmd'
import { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import { initial, testFlowClientCtx } from '../@/testing/client'
import { BuilderClient } from '../client'
import { BuilderCore } from '../core'

describe(import.meta.file, () => {
  it('play a sound when changing list tabs', async () => {
    const ctx = await testFlowClientCtx()
    const output = GameClientModule.andThen(initial, (model) =>
      BuilderClient.update({
        ctx,
        model,
        modelCore: BuilderCore.init({ ctx }),
        msgCore: withEventMeta({
          t: 'flow.builder.screen-main-menu.user-clicked-option',
          userId: ctx.currentUserId,
          option: 'pack-builder',
        }),
      }),
    )
    expect(didPlaySound(output)).toBe(true)
  })
})
