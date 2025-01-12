import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { initial, testFlowFrontendCtx } from '../@/testing/frontend'
import { BuilderFrontend } from '../frontend'
import { BuilderSpace } from '../space'

describe(import.meta.file, () => {
  it('play a sound when changing list tabs', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = GameFrontendModule.andThen(initial, (model) =>
      BuilderFrontend.update({
        ctx,
        model,
        modelSpace: BuilderSpace.initSpace({ ctx }),
        msgSpace: withEventMeta({
          t: 'flow.builder.screen-main-menu.user-clicked-option',
          userId: ctx.currentUserId,
          option: 'pack-builder',
        }),
      }),
    )
    expect(didPlaySound(output)).toBe(true)
  })
})
