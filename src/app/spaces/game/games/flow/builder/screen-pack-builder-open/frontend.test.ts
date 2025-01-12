import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Pack } from '../../@/pack/pack'
import { FixtureFlowBuilderFrontend } from '../@/testing/frontend'

describe(import.meta.file, () => {
  test('open pack builder', async () => {
    const f = await FixtureFlowBuilderFrontend()
    const pack = await Pack.random({
      createdBy: f.ctx.currentUserId,
    })
    const output = f.update(f.init, [
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'screen-pack-builder-open.user-clicked-pack-item',
            pack,
            userId: f.ctx.currentUserId,
          },
        },
      },
    ])

    expect(output.modelSpace.screenPackBuilder?.pack.id === pack.id).toBe(true)
  })

  test('play sound', async () => {
    const f = await FixtureFlowBuilderFrontend()
    const pack = await Pack.random({
      createdBy: f.ctx.currentUserId,
    })
    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-pack-builder-open.user-clicked-pack-item',
          pack,
          userId: f.ctx.currentUserId,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
