import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Puzzle } from '../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../@/fixture/frontend'
import { PuzzleDbQuery } from '../../@/puzzle/puzzle-db/query'

const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()
  const puzzle = await Puzzle.random({
    createdBy: f.ctx.currentUserId,
  })

  return {
    ...f,
    puzzle,
  }
}

describe(import.meta.file, () => {
  test('open puzzle builder', async () => {
    const f = await Fixture()

    const output = f.update(f.init, [
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
            puzzle: f.puzzle,
            userId: f.ctx.currentUserId,
          },
        },
      },
    ])
    expect(
      output.modelSpace.screen.t === 'screen-puzzle-builder' &&
        output.modelSpace.screenPuzzleBuilder?.puzzle.id === f.puzzle.id,
    ).toBe(true)
  })

  test('play a sound when opening puzzle builder', async () => {
    const f = await Fixture()

    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
          puzzle: f.puzzle,
          userId: f.ctx.currentUserId,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('play a sound when query changes', async () => {
    const f = await Fixture()

    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-puzzle-builder-open.puzzle-list-query-changed',
          userId: f.ctx.currentUserId,
          query: PuzzleDbQuery.random(),
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
