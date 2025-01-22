import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { ScreenAddPuzzle } from './frontend'

const Fixture = FixturePackBuilderFrontend

describe.only(import.meta.file, () => {
  test('play sound opening add puzzle screen', async () => {
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

  test('play sound sound clicking puzzle list item', async () => {
    const f = await Fixture()

    const output = ScreenAddPuzzle.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        userId: f.ctx.currentUserId,
        puzzle: f.puzzle,
      }),
    })

    expect(didPlaySound(output)).toBe(true)
  })
})
