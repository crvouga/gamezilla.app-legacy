import { describe, expect, test } from '~/@/test-runner'
import { Logger } from '~/@/logger'
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
import { NumberlinkPlaySpaceFixture } from '../@/space/fixture'
import { FixtureScreenPuzzlePlaySpaceChild } from './@/fixture/space'
import { ScreenPlayPuzzleSpace } from './space'
import type { MsgSpace } from './types'

const Fixture = async (input?: { numberlink?: NumberlinkVariant.Model }) => {
  const f = await FixtureScreenPuzzlePlaySpaceChild(input)

  return {
    ...f,
  }
}

describe('ScreenPlayPuzzleSpace', () => {
  test('should close puzzle after clicking exit puzzle button', async () => {
    const f = await Fixture()
    const after = f.parent.update(f.parent.init, [{ t: 'user-clicked-exit-play-puzzle-screen', userId: f.hostId }])
    expect(f.parent.init.screen.t).toEqual('screen-play-puzzle')
    expect(after.screen.t).toEqual('screen-select-puzzle')
  })

  test('should update puzzle screen play ui', async () => {
    const f = await Fixture()
    const after = f.update(
      f.init,
      ModePlay.randomMsgs({ numberlink: f.puzzle.model }).map(
        (c): MsgSpace => ({ userId: UserId.generate(), t: 'got-numberlink-play-msg', c }),
      ),
    )

    expect(f.init.modePlay).not.toEqual(after.modePlay)
  })

  test('should go to next puzzle after the user clicks the next button', async () => {
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

  test('should go to prev puzzle after the user clicks the prev button', async () => {
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

  test('should start with empty puzzle after going to next puzzle', async () => {
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
              solutions: await Solutions.find({ models: [f.nextPuzzle.c.model], logger: Logger({ t: 'noop' }) }),
            }),
          })
        : null,
    )
  })

  test('should go into puzzle solved state after solving', async () => {
    const f = await Fixture()
    const before = f.init
    const after = f.update(before, f.solvePuzzleMsgs)
    if (!after.modePlay) throw new Error('failed to setup test')
    const afterFlow = ModePlay.toNumberlink(after.modePlay, f.puzzle.model)

    expect(ScreenPlayPuzzleSpace.toStatus(before)).toEqual('solving')
    expect(ScreenPlayPuzzleSpace.toStatus(after)).toEqual('solved')
    expect(AlgoIsSolved.isSolved(afterFlow)).toEqual(true)
  })

  test('should open puzzle complete dialog after solving', async () => {
    const f = await Fixture()

    const after = f.update(f.init, f.solvePuzzleMsgs)

    expect(ScreenPlayPuzzleSpace.toStatus(after) === 'solved' && after.opened === 'puzzle-complete').toEqual(true)
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
    expect(ScreenPlayPuzzleSpace.toStatus(after) === 'solved').toEqual(true)
  })

  test('should be able to close the puzzle complete dialog', async () => {
    const f = await Fixture()
    const before = f.update(f.init, f.solvePuzzleMsgs)
    const after = f.update(before, [
      {
        t: 'user-closed-puzzle-complete-dialog',
        userId: f.hostId,
      },
    ])
    expect(ScreenPlayPuzzleSpace.toStatus(after) === 'solved' && after.opened === null).toEqual(true)
  })

  test('should close puzzle complete dialog after clicking next puzzle button', async () => {
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
    expect(after.opened === null).toEqual(true)
  })

  test('should only open puzzle complete dialog when transitions to solved state', async () => {
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
    expect(before.opened === null).toEqual(true)
    expect(after.opened === null).toEqual(true)
  })

  test('should close puzzle complete dialog after clicking prev puzzle button', async () => {
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
    expect(before.opened === 'puzzle-complete').toEqual(true)
    expect(after.opened === null).toEqual(true)
  })

  test('should clear puzzle after clicking reset button', async () => {
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
      solutions: await Solutions.find({ models: [f.puzzle.model], logger: Logger({ t: 'noop' }) }),
    })

    expect(before.modePlay).toEqual(ModePlay.init({ ctx }))
  })

  test('should be in a solving state after going to the next puzzle', async () => {
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
    expect(ScreenPlayPuzzleSpace.toStatus(output)).toEqual('solving')
  })

  test('should be in a solving state after going to the prev puzzle', async () => {
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
    expect(ScreenPlayPuzzleSpace.toStatus(output)).toEqual('solving')
  })

  test('open action drawer', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        t: 'user-toggled-action-buttons-drawer',
        userId: f.hostId,
      },
    ])
    expect(output.opened).toEqual('action-drawer')
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
    expect(output.opened).toEqual(null)
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
    expect(output[0].opened).toEqual(null)
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
    expect(output[1]?.puzzleResult.t).toEqual('not-found')
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
    expect(output[1]?.puzzleResult.t).toEqual('not-found')
  })

  test('output user completed puzzle event', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [...f.solvePuzzleMsgs])
    expect(output.events?.some((e) => e.t === 'user-completed-puzzle')).toEqual(true)
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
    expect(output.events?.some((e) => e.t === 'user-used-hint')).toEqual(true)
  })

  test('should be on the slide index corresponding with the opened puzzle', async () => {
    const f = await NumberlinkPlaySpaceFixture()
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
