import { describe, expect, it, test } from 'bun:test'
import { UserId } from '~/app/@/data/user-id'
import { Flow } from '../../@/flow'
import { Pack } from '../../@/pack/pack'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { PlayMode } from '../../@/play-mode'
import { Puzzle } from '../../@/puzzle/puzzle'
import { Solutions } from '../../@/solutions/solutions'
import { type Variant } from '../../@/variant'
import { VariantGrid, VariantGridShorthand } from '../../@/variant/grid'
import { FlowPlaySpaceFixture } from '../@/space/fixture'
import { FixtureScreenPuzzlePlaySpaceChild } from './@/fixture/space'
import { ScreenPlayPuzzleSpace } from './space'
import type { MsgSpace } from './types'

const Fixture = async (input?: { flow?: Variant.Model }) => {
  const f = await FixtureScreenPuzzlePlaySpaceChild(input)

  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should close puzzle after clicking exit puzzle button', async () => {
    const f = await Fixture()
    const after = f.parent.update(f.parent.init, [{ t: 'user-clicked-exit-play-puzzle-screen', userId: f.hostId }])
    expect(f.parent.init.screen.t).toEqual('screen-play-puzzle')
    expect(after.screen.t).toEqual('screen-select-puzzle')
  })

  it('should update puzzle screen flow play ui', async () => {
    const f = await Fixture()
    const after = f.update(
      f.init,
      PlayMode.randomMsgs(f.puzzle).map(
        (c): MsgSpace => ({
          userId: UserId.generate(),
          t: 'got-flow-play-msg',
          c,
        }),
      ),
    )

    expect(f.init.playMode).not.toEqual(after.playMode)
  })

  it('should go to next puzzle after the user clicks the next button', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        t: 'user-clicked-next-puzzle',
        nextPuzzle: f.nextPuzzle,
        nextPuzzleIndex: f.nextPuzzleIndex,
        userId: f.hostId,
      },
    ])

    expect(f.init.puzzleIndex).toEqual(f.puzzleIndex)
    expect(after.puzzleIndex).toEqual(f.puzzleIndex + 1)
  })

  it('should go to prev puzzle after the user clicks the prev button', async () => {
    const f = await Fixture()
    const before = f.update(f.init, [
      {
        t: 'user-clicked-next-puzzle',
        nextPuzzle: f.nextPuzzle,
        nextPuzzleIndex: f.nextPuzzleIndex,
        userId: f.hostId,
      },
    ])
    const after = f.update(before, [
      {
        t: 'user-clicked-prev-puzzle',
        prevPuzzle: { t: 'got', c: f.puzzle },
        prevPuzzleIndex: f.puzzleIndex,
        userId: f.hostId,
      },
    ])
    expect(before.puzzleIndex).toEqual(f.puzzleIndex + 1)
    expect(after.puzzleIndex).toEqual(f.puzzleIndex)
  })

  it('should start with empty puzzle after going to next puzzle', async () => {
    const f = await Fixture()

    const msgs = PlayMode.randomMsgs({
      flow: f.puzzle.flow,
    }).map(
      (c): MsgSpace => ({
        userId: UserId.generate(),
        t: 'got-flow-play-msg',
        c,
      }),
    )

    const before = f.update(f.init, msgs)
    const after = f.update(f.init, [
      {
        t: 'user-clicked-next-puzzle',
        nextPuzzle: f.nextPuzzle,
        nextPuzzleIndex: f.nextPuzzleIndex,
        userId: f.hostId,
      },
    ])

    expect(before.playMode).not.toEqual(after.playMode)
    expect(after.playMode).toEqual(
      f.nextPuzzle.t === 'got'
        ? PlayMode.init({
            ctx: PlayMode.initCtx({
              flow: f.nextPuzzle.c.flow,
              solutions: await Solutions.find([f.nextPuzzle.c.flow]),
            }),
          })
        : null,
    )
  })

  it('should go into puzzle solved state after solving', async () => {
    const f = await Fixture()
    const before = f.init
    const after = f.update(before, f.solvePuzzleMsgs)
    const afterFlow = PlayMode.toFlow({
      flow: f.puzzle.flow,
      model:
        after.playMode ??
        PlayMode.init({
          ctx: PlayMode.initCtx({ flow: f.puzzle.flow, solutions: await Solutions.find([f.puzzle.flow]) }),
        }),
    })

    expect(ScreenPlayPuzzleSpace.toStatus(before)).toBe('solving')
    expect(ScreenPlayPuzzleSpace.toStatus(after)).toBe('solved')
    expect(Flow.isSolved(afterFlow)).toBe(true)
  })

  it('should open puzzle complete dialog after solving', async () => {
    const f = await Fixture()

    const after = f.update(f.init, f.solvePuzzleMsgs)

    expect(ScreenPlayPuzzleSpace.toStatus(after) === 'solved' && after.opened === 'puzzle-complete').toBe(true)
  })

  test('still in solved state after pressing solved board', async () => {
    const f = await Fixture({
      flow: VariantGridShorthand.toGrid([
        [' ', ' ', 'A'],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ]),
    })
    const before = f.update(f.init, f.solvePuzzleMsgs)
    const nodeId = VariantGrid.toNodeId({
      x: 0,
      y: 0,
    })
    if (!nodeId) throw new Error('nodeId not found')
    const after = f.update(before, [
      {
        userId: UserId.generate(),
        t: 'got-flow-play-msg',
        c: {
          t: 'user-pressed-down-node',
          nodeId,
        },
      },
    ])
    expect(ScreenPlayPuzzleSpace.toStatus(after) === 'solved').toBe(true)
  })

  it('should be able to close the puzzle complete dialog', async () => {
    const f = await Fixture()
    const before = f.update(f.init, f.solvePuzzleMsgs)
    const after = f.update(before, [
      {
        t: 'user-closed-puzzle-complete-dialog',
        userId: f.hostId,
      },
    ])
    expect(ScreenPlayPuzzleSpace.toStatus(after) === 'solved' && after.opened === null).toBe(true)
  })

  it('should close puzzle complete dialog after clicking next puzzle button', async () => {
    const f = await Fixture()
    const before = f.update(f.init, f.solvePuzzleMsgs)
    const after = f.update(before, [
      {
        t: 'user-clicked-next-puzzle',
        nextPuzzle: f.nextPuzzle,
        nextPuzzleIndex: f.nextPuzzleIndex,
        userId: f.hostId,
      },
    ])
    expect(after.opened === null).toBe(true)
  })

  it('should only open puzzle complete dialog when transitions to solved state', async () => {
    const f = await Fixture()
    const endId = Flow.randomTerminal(f.puzzle.flow)?.endId

    if (!endId) throw new Error('endId not found')

    const before = f.update(f.init, [
      ...f.solvePuzzleMsgs,
      {
        t: 'user-closed-puzzle-complete-dialog',
        userId: f.hostId,
      },
    ])
    const after = f.update(before, [
      {
        t: 'got-flow-play-msg',
        c: {
          t: 'user-pressed-up-node',
          nodeId: endId,
        },
        userId: UserId.generate(),
      },
    ])
    expect(before.opened === null).toBe(true)
    expect(after.opened === null).toBe(true)
  })

  it('should close puzzle complete dialog after clicking prev puzzle button', async () => {
    const f = await Fixture()
    const before = f.update(f.init, f.solvePuzzleMsgs)
    const after = f.update(before, [
      {
        t: 'user-clicked-prev-puzzle',
        prevPuzzle: f.prevPuzzle,
        prevPuzzleIndex: f.prevPuzzleIndex,
        userId: f.hostId,
      },
    ])
    expect(before.opened === 'puzzle-complete').toBe(true)
    expect(after.opened === null).toBe(true)
  })

  it('should clear puzzle after clicking reset button', async () => {
    const f = await Fixture()
    const before = f.update(f.init, [
      ...f.solvePuzzleMsgs,
      {
        t: 'user-clicked-reset-puzzle',
        userId: f.hostId,
      },
    ])
    expect(before.playMode).toEqual(
      PlayMode.init({
        ctx: PlayMode.initCtx({
          flow: f.puzzle.flow,
          solutions: await Solutions.find([f.puzzle.flow]),
        }),
      }),
    )
  })

  it('should be in a solving state after going to the next puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      ...f.solvePuzzleMsgs,
      {
        t: 'user-clicked-next-puzzle',
        nextPuzzle: f.nextPuzzle,
        nextPuzzleIndex: f.nextPuzzleIndex,
        userId: f.hostId,
      },
    ])
    expect(ScreenPlayPuzzleSpace.toStatus(output)).toBe('solving')
  })

  it('should be in a solving state after going to the prev puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      ...f.solvePuzzleMsgs,
      {
        t: 'user-clicked-prev-puzzle',
        prevPuzzle: f.prevPuzzle,
        prevPuzzleIndex: f.prevPuzzleIndex,
        userId: f.hostId,
      },
    ])
    expect(ScreenPlayPuzzleSpace.toStatus(output)).toBe('solving')
  })

  test('open action drawer', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        t: 'user-toggled-action-buttons-drawer',
        userId: f.hostId,
      },
    ])
    expect(output.opened).toBe('action-drawer')
  })

  test('close action drawer', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        t: 'user-toggled-action-buttons-drawer',
        userId: f.hostId,
      },
      {
        t: 'user-toggled-action-buttons-drawer',
        userId: f.hostId,
      },
    ])
    expect(output.opened).toBe(null)
  })

  test('close action drawer', async () => {
    const f = await Fixture()
    const output = f.updates(f.init, [
      {
        t: 'user-toggled-action-buttons-drawer',
        userId: f.hostId,
      },
      {
        t: 'user-clicked-copy-to-clipboard',
        // userId: f.hostId,
      },
    ])
    expect(output[0].opened).toBe(null)
  })

  test('open next puzzle not found', async () => {
    const f = await Fixture()
    const output = f.updates(f.init, [
      {
        t: 'user-clicked-next-puzzle',
        nextPuzzle: { t: 'not-found' },
        nextPuzzleIndex: f.nextPuzzleIndex,
        userId: f.hostId,
      },
    ])
    expect(output[1]?.puzzleResult.t).toBe('not-found')
  })

  test('open prev puzzle not found', async () => {
    const f = await Fixture()
    const output = f.updates(f.init, [
      {
        t: 'user-clicked-prev-puzzle',
        prevPuzzle: { t: 'not-found' },
        prevPuzzleIndex: f.prevPuzzleIndex,
        userId: f.hostId,
      },
    ])
    expect(output[1]?.puzzleResult.t).toBe('not-found')
  })

  test('output user completed puzzle event', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [...f.solvePuzzleMsgs])
    expect(output.events?.some((e) => e.t === 'user-completed-puzzle')).toBe(true)
  })

  test('output user used hint event', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        t: 'got-flow-play-msg',
        c: { t: 'user-clicked-use-hint', solutions: f.ctx.solutions },
        userId: UserId.generate(),
      },
    ])
    expect(output.events?.some((e) => e.t === 'user-used-hint')).toBe(true)
  })

  it('should be on the slide index corresponding with the opened puzzle', async () => {
    const f = await FlowPlaySpaceFixture()
    const puzzles = await Promise.all(
      Array.from({ length: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT * 2 }, () => Puzzle.random()),
    )
    const pack = await Pack.random({ puzzleIds: puzzles.map((p) => p.id) })
    const secondSlidePuzzle = puzzles[PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1]
    if (!secondSlidePuzzle) throw new Error('failed to setup test')
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
        puzzle: { t: 'got', c: secondSlidePuzzle },
        puzzleIndex: puzzles.findIndex((p) => p.id === secondSlidePuzzle.id),
        userId: f.hostId,
      },
      {
        t: 'user-clicked-exit-play-puzzle-screen',
        userId: f.hostId,
      },
    ])

    expect(before.screen.t).toEqual('screen-select-puzzle')
    if (before.screen.t === 'screen-select-puzzle') expect(before.screen.slideIndex).toEqual(0)
    expect(after.screen.t).toEqual('screen-select-puzzle')
    if (after.screen.t === 'screen-select-puzzle') expect(after.screen.slideIndex).toEqual(1)
  })
})
