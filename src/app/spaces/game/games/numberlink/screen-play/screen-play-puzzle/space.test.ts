import { describe, expect, it, test } from 'bun:test'
import { loggerNoop } from '~/@/logger/impl-noop'
import { UserId } from '~/app/@/data/user-id'
import { Numberlink } from '../../@/numberlink'
import { ModePlay } from '../../@/mode-play'
import { Pack } from '../../@/pack/pack'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { Puzzle } from '../../@/puzzle/puzzle'
import { AlgoIsSolved } from '../../@/solutions/algo-is-solved/algo-is-solved'
import { Solutions } from '../../@/solutions/solutions'
import { type NumberlinkVariant } from '../../@/variant'
import { VariantGrid, VariantGridShorthand } from '../../@/variant/grid'
import { FlowPlaySpaceFixture } from '../@/space/fixture'
import { FixtureScreenPuzzlePlaySpaceChild } from './@/fixture/space'
import { ScreenPlayPuzzleSpace } from './space'
import type { MsgSpace } from './types'

const Fixture = async (input?: { numberlink?: NumberlinkVariant.Model }) => {
  const f = await FixtureScreenPuzzlePlaySpaceChild(input)

  return {
    ...f,
  }
}

describe('Test', () => {
  it('should close puzzle after clicking exit puzzle button', async () => {
    const f = await Fixture()
    const after = f.parent.update(f.parent.init, [{ t: 'user-clicked-exit-play-puzzle-screen', userId: f.hostId }])
    expect(f.parent.init.screen.t).toEqual('screen-play-puzzle')
    expect(after.screen.t).toEqual('screen-select-puzzle')
  })

  it('should update puzzle screen play ui', async () => {
    const f = await Fixture()
    const after = f.update(
      f.init,
      ModePlay.randomMsgs({ numberlink: f.puzzle.model }).map(
        (c): MsgSpace => ({ userId: UserId.generate(), t: 'got-numberlink-play-msg', c }),
      ),
    )

    expect(f.init.modePlay).not.toEqual(after.modePlay)
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

    const msgs = ModePlay.randomMsgs({
      numberlink: f.puzzle.model,
    }).map(
      (c): MsgSpace => ({
        userId: UserId.generate(),
        t: 'got-numberlink-play-msg',
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

    expect(before.modePlay).not.toEqual(after.modePlay)
    expect(after.modePlay).toEqual(
      f.nextPuzzle.t === 'got'
        ? ModePlay.init({
            ctx: ModePlay.initCtx({
              numberlink: f.nextPuzzle.c.model,
              solutions: await Solutions.find({ models: [f.nextPuzzle.c.model], logger: loggerNoop }),
            }),
          })
        : null,
    )
  })

  it('should go into puzzle solved state after solving', async () => {
    const f = await Fixture()
    const before = f.init
    const after = f.update(before, f.solvePuzzleMsgs)
    if (!after.modePlay) throw new Error('failed to setup test')
    const afterFlow = ModePlay.toNumberlink(after.modePlay, f.puzzle.model)

    expect(ScreenPlayPuzzleSpace.toStatus(before)).toBe('solving')
    expect(ScreenPlayPuzzleSpace.toStatus(after)).toBe('solved')
    expect(AlgoIsSolved.isSolved(afterFlow)).toBe(true)
  })

  it('should open puzzle complete dialog after solving', async () => {
    const f = await Fixture()

    const after = f.update(f.init, f.solvePuzzleMsgs)

    expect(ScreenPlayPuzzleSpace.toStatus(after) === 'solved' && after.opened === 'puzzle-complete').toBe(true)
  })

  test('still in solved state after pressing solved board', async () => {
    const f = await Fixture({
      numberlink: VariantGridShorthand.toGrid([
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
        t: 'got-numberlink-play-msg',
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
    const endId = Numberlink.randomTerminal(f.puzzle.model)?.endId

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
        t: 'got-numberlink-play-msg',
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
        t: 'got-numberlink-play-msg',
        c: {
          t: 'user-clicked-reset',
        },
        userId: f.hostId,
      },
    ])

    const ctx = ModePlay.initCtx({
      numberlink: f.puzzle.model,
      solutions: await Solutions.find({ models: [f.puzzle.model], logger: loggerNoop }),
    })

    expect(before.modePlay).toEqual(ModePlay.init({ ctx }))
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
        t: 'got-numberlink-play-msg',
        c: { t: 'user-clicked-use-hint', solutions: f.solutions },
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
