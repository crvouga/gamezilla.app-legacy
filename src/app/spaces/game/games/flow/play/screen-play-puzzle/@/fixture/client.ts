import { withEventMeta } from '~/@/event-sourced/event'
import { UserId } from '~/app/@/data/user-id'
import { FlowPlay } from '../../../../@/flow/flow-play'
import { Pack } from '../../../../@/pack/pack'
import { PuzzleResult } from '../../../../@/puzzle/puzzle-result'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { FixtureFlowPlayClient, type FixtureUpdateInput } from '../../../@/client/fixture'

const toCompletePuzzleMsgs = (puzzle: Puzzle) => {
  const userId = UserId.generate()
  return FlowPlay.toSolutionMsgs({
    flow: puzzle.flow
  }).map(
    (c): FixtureUpdateInput => ({
      msgCore: withEventMeta({
        t: 'got-flow-play-msg',
        userId,
        c
      })
    })
  )
}

export const FixtureScreenPlayPuzzleClient = async () => {
  const f = await FixtureFlowPlayClient()
  const puzzle = await Puzzle.random()
  const nextPuzzle = await Puzzle.random()
  const prevPuzzle = await Puzzle.random()

  const nextPuzzleResult: PuzzleResult = { t: 'got', c: nextPuzzle }
  const prevPuzzleResult: PuzzleResult = { t: 'got', c: prevPuzzle }

  const pack = await Pack.random({
    puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id]
  })
  const puzzleIndex = 1
  const prevPuzzleIndex = 0
  const nextPuzzleIndex = 2

  const init = f.update(f.initial, [
    {
      msg: {
        t: 'got-msg-core',
        c: {
          t: 'user-clicked-open-pack-list-item',
          pack
        }
      }
    },
    {
      msg: {
        t: 'got-msg-core',
        c: {
          t: 'user-clicked-open-puzzle-grid-item',
          flowPuzzle: { t: 'got', c: puzzle },
          puzzleIndex
        }
      }
    }
  ])

  const firstPuzzle = prevPuzzle
  const firstPuzzleIndex = 0
  const lastPuzzle = nextPuzzle
  const lastPuzzleIndex = 2

  const completePuzzleMsgs = toCompletePuzzleMsgs(puzzle)
  const completeLastPuzzleMsgs: FixtureUpdateInput[] = [
    {
      msgCore: withEventMeta({
        t: 'user-clicked-next-puzzle',
        nextPuzzleIndex: lastPuzzleIndex,
        nextPuzzle: {
          t: 'got',
          c: lastPuzzle
        }
      })
    },
    ...toCompletePuzzleMsgs(lastPuzzle)
  ]

  return {
    ...f,
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
    prevPuzzleIndex
  }
}
