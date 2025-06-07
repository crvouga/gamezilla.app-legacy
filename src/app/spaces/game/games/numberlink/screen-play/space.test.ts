import { describe, expect, it, test } from 'bun:test'
import { UserId } from '~/app/@/data/user-id'
import { Pack } from '../@/pack/pack'
import { Puzzle } from '../@/puzzle/puzzle'
import { FlowPlaySpaceFixture } from './@/space/fixture'

describe(import.meta.file, () => {
  it('should be able to open pack from list', async () => {
    const f = await FlowPlaySpaceFixture()
    const before = f.init
    const after = f.update(before, [
      {
        t: 'user-clicked-open-pack-puzzle-grid-item',
        pack: await Pack.random(),
        userId: f.hostId,
      },
    ])

    expect(before.screen.t).toEqual('screen-select-pack')
    expect(after.screen.t).toEqual('screen-select-puzzle')
  })

  it('should exit to select pack screen after clicking exit button', async () => {
    const f = await FlowPlaySpaceFixture()
    const before = f.update(f.init, [
      {
        t: 'user-clicked-open-pack-puzzle-grid-item',
        userId: f.hostId,
        pack: await Pack.random(),
      },
    ])
    const after = f.update(before, [
      {
        userId: f.hostId,
        t: 'user-clicked-exit-screen-open-pack',
      },
    ])
    expect(before.screen.t).toEqual('screen-select-puzzle')
    expect(after.screen.t).toEqual('screen-select-pack')
  })

  it('should open puzzle from pack', async () => {
    const f = await FlowPlaySpaceFixture()
    const puzzle = await Puzzle.random()
    const pack = await Pack.random({
      puzzleIds: [puzzle.id],
    })

    const before = f.update(f.init, [
      {
        t: 'user-clicked-open-pack-puzzle-grid-item',
        pack,
        userId: f.hostId,
      },
    ])

    const after = f.update(before, [
      {
        t: 'user-clicked-open-screen-play-puzzle',
        puzzle: {
          t: 'got',
          c: puzzle,
        },
        puzzleIndex: 0,
        userId: f.hostId,
      },
    ])
    expect(before.screen.t).toEqual('screen-select-puzzle')
    expect(after.screen.t).toEqual('screen-play-puzzle')
    if (after.screen.t === 'screen-play-puzzle' && after.screen.puzzleResult.t === 'got') {
      expect(after.screen.puzzleResult.c.id).toEqual(puzzle.id)
    }
  })

  test('user changed slides', async () => {
    const f = await FlowPlaySpaceFixture()
    const puzzle = await Puzzle.random()
    const pack = await Pack.random({
      puzzleIds: [puzzle.id],
    })

    const before = f.update(f.init, [
      {
        t: 'user-clicked-open-pack-puzzle-grid-item',
        pack,
        userId: f.hostId,
      },
    ])

    const after = f.update(before, [
      {
        t: 'user-changed-slides',
        slideIndex: 1,
        userId: UserId.generate(),
      },
    ])
    expect(before.screen.t).toEqual('screen-select-puzzle')
    if (before.screen.t === 'screen-select-puzzle') {
      expect(before.screen.slideIndex).toEqual(0)
    }
    expect(after.screen.t).toEqual('screen-select-puzzle')
    if (after.screen.t === 'screen-select-puzzle') {
      expect(after.screen.slideIndex).toEqual(1)
    }
  })
})
