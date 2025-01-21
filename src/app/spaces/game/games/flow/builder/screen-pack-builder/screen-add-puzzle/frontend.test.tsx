import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { ScreenAddPuzzle } from './frontend'

const Fixture = FixturePackBuilderFrontend

describe(import.meta.file, () => {
  it('should play sound opening add puzzle screen', async () => {
    const f = await Fixture()

    const output = ScreenAddPuzzle.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.ctx.currentUserId,
      }),
    })

    expect(didPlaySound(output)).toBe(true)
  })
})
