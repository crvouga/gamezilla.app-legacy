import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/client/client-cmd'
import { Pack } from '../../@/pack/pack'
import { FixtureFlowBuilderClient } from '../@/testing/client'

describe(import.meta.file, () => {
  test('open pack builder', async () => {
    const f = await FixtureFlowBuilderClient()
    const pack = await Pack.random({
      createdBy: f.ctx.currentUserId
    })
    const output = f.update(f.init, [
      {
        msg: {
          t: 'got-msg-core',
          c: {
            t: 'screen-pack-builder-open.user-clicked-pack-item',
            pack,
            userId: f.ctx.currentUserId
          }
        }
      }
    ])

    expect(output.modelCore.screenPackBuilder?.pack.id === pack.id).toBe(true)
  })

  test('play sound', async () => {
    const f = await FixtureFlowBuilderClient()
    const pack = await Pack.random({
      createdBy: f.ctx.currentUserId
    })
    const output = f.update(f.init, [
      {
        msgCore: withEventMeta({
          t: 'screen-pack-builder-open.user-clicked-pack-item',
          pack,
          userId: f.ctx.currentUserId
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
