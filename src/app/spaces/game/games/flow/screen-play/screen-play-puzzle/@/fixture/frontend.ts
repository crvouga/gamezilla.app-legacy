import { withEventMeta } from '~/@/event-sourced/event'
import { UserId } from '~/app/@/data/user-id'
import { ModePlay } from '../../../../@/mode-play'
import { Pack } from '../../../../@/pack/pack'
import { PuzzleResult } from '../../../../@/puzzle/puzzle-result'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { FixturePlayFrontend, type FixtureUpdateInput } from '../../../@/frontend/fixture'
import { Solutions } from '../../../../@/solutions/solutions'
import { FlowFrontendCtx } from '../../../../@/frontend/ctx'
import { loggerNoop } from '~/@/logger/impl-noop'

const toCompletePuzzleMsgs = (puzzle: Puzzle) => {
  const userId = UserId.generate()
  return ModePlay.toSolutionMsgs({
    flow: puzzle.flow,
  }).map(
    (c): FixtureUpdateInput => ({
      msgSpace: withEventMeta({
        t: 'got-flow-play-msg',
        userId,
        c,
      }),
    }),
  )
}

export const FixtureScreenPlayPuzzleFrontend = async () => {
  const f = await FixturePlayFrontend()
  const puzzle = await Puzzle.random()
  const nextPuzzle = await Puzzle.random()
  const prevPuzzle = await Puzzle.random()

  const solutions = await Solutions.find({
    models: [puzzle.flow, nextPuzzle.flow, prevPuzzle.flow],
    logger: loggerNoop,
  })
  const ctx: FlowFrontendCtx = {
    ...f.ctx,
    solutions,
  }

  const nextPuzzleResult: PuzzleResult = { t: 'got', c: nextPuzzle }
  const prevPuzzleResult: PuzzleResult = { t: 'got', c: prevPuzzle }

  const pack = await Pack.random({
    puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id],
  })
  const puzzleIndex = 1
  const prevPuzzleIndex = 0
  const nextPuzzleIndex = 2

  const init = f.update(f.initial, [
    {
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'user-clicked-open-pack-puzzle-grid-item',
          pack,
          userId: f.hostId,
        },
      },
    },
    {
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'user-clicked-open-screen-play-puzzle',
          userId: f.hostId,
          puzzle: { t: 'got', c: puzzle },
          puzzleIndex,
        },
      },
    },
  ])

  const firstPuzzle = prevPuzzle
  const firstPuzzleIndex = 0
  const lastPuzzle = nextPuzzle
  const lastPuzzleIndex = 2

  const completePuzzleMsgs = toCompletePuzzleMsgs(puzzle)
  const completeLastPuzzleMsgs: FixtureUpdateInput[] = [
    {
      msgSpace: withEventMeta({
        t: 'user-clicked-next-puzzle',
        nextPuzzleIndex: lastPuzzleIndex,
        userId: f.hostId,
        nextPuzzle: {
          t: 'got',
          c: lastPuzzle,
        },
      }),
    },
    ...toCompletePuzzleMsgs(lastPuzzle),
  ]

  return {
    ...f,
    ctx,
    completeLastPuzzleMsgs,
    completePuzzleMsgs,
    init,
    pack,
    puzzle,
    puzzleIndex,
    firstPuzzle,
    firstPuzzleIndex,
    lastPuzzle,
    lastPuzzleIndex,
    //
    nextPuzzle: nextPuzzleResult,
    nextPuzzleIndex,
    prevPuzzle: prevPuzzleResult,
    prevPuzzleIndex,
  }
}
