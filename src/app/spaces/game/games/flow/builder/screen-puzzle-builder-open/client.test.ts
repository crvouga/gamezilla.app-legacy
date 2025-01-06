import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/client/cmd'
import { Puzzle } from '../../@/puzzle/puzzle'
import { FixtureFlowBuilderClient } from '../@/testing/client'

describe(import.meta.file, () => {
  test('open puzzle builder', async () => {
    const f = await FixtureFlowBuilderClient()
    const puzzle = await Puzzle.random({
      createdBy: f.ctx.currentUserId,
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'got-msg-core',
          c: {
            t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
            puzzle,
            userId: f.ctx.currentUserId,
          },
        },
      },
    ])
    expect(
      output.modelCore.screen.t === 'screen-puzzle-builder' &&
        output.modelCore.screenPuzzleBuilder?.puzzle.id === puzzle.id,
    ).toBe(true)
  })

  test('play a sound when opening puzzle builder', async () => {
    const f = await FixtureFlowBuilderClient()
    const puzzle = await Puzzle.random({
      createdBy: f.ctx.currentUserId,
    })

    const output = f.update(f.init, [
      {
        msgCore: withEventMeta({
          t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
          puzzle,
          userId: f.ctx.currentUserId,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
