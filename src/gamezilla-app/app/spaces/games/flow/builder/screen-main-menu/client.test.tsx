import { describe, expect, it } from 'bun:test'
import { didPlaySound } from 'gamezilla-app/app/@/client'
import { withEventMeta } from 'gamezilla-app/@/event-sourced/event'
import { andThen } from 'gamezilla-app/app/spaces/games/@/architecture/game-client-v2'
import { initial, testFlowClientCtx } from '../@/testing/client'
import { BuilderClient } from '../client'
import { BuilderCore } from '../core'

describe(import.meta.file, () => {
  it('play a sound when changing list tabs', async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(initial, (model) =>
      BuilderClient.update({
        ctx,
        model,
        modelCore: BuilderCore.initCore({ ctx }),
        msgCore: withEventMeta({
          t: 'screen-main-menu.user-clicked-option',
          userId: ctx.currentUserId,
          option: 'packs'
        })
      })
    )
    expect(didPlaySound(output)).toBe(true)
  })
})
