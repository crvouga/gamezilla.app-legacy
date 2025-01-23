import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { Puzzle } from '../../../@/puzzle/puzzle'

const Fixture = async () => {
  const f = await FixturePackBuilderFrontend()
  return { ...f }
}
describe(import.meta.file, () => {
  test('play sound opening add puzzle screen', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
          userId: f.hostId,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('play sound opening puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-pack-builder.user-clicked-pack-item',
          userId: f.hostId,
          puzzleIndex: 0,
          puzzleResult: { t: 'got', c: await Puzzle.random() },
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
