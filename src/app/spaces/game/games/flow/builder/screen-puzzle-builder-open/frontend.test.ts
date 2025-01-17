import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Puzzle } from '../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../@/fixture/frontend'

describe(import.meta.file, () => {
  test('open puzzle builder', async () => {
    const f = await FixtureFlowBuilderFrontend()
    const puzzle = await Puzzle.random({
      createdBy: f.ctx.currentUserId,
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
            puzzle,
            userId: f.ctx.currentUserId,
          },
        },
      },
    ])
    expect(
      output.modelSpace.screen.t === 'screen-puzzle-builder' &&
        output.modelSpace.screenPuzzleBuilder?.puzzle.id === puzzle.id,
    ).toBe(true)
  })

  test('play a sound when opening puzzle builder', async () => {
    const f = await FixtureFlowBuilderFrontend()
    const puzzle = await Puzzle.random({
      createdBy: f.ctx.currentUserId,
    })

    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
          puzzle,
          userId: f.ctx.currentUserId,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
