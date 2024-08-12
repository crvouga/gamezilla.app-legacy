import { withEventMeta } from 'gamezilla-app/app/spaces/@/event'
import { FlowPack } from '../../../@/flow-pack'
import { FlowPuzzle } from '../../../@/flow-puzzle'
import { FlowPlay } from '../../../@/flow/flow-play'
import { FixtureFlowPlayClient, type FixtureUpdateInput } from '../../@/fixture.client'
import { FlowPuzzleResult } from '../../@/puzzle-result'

const toCompletePuzzleMsgs = (puzzle: FlowPuzzle) =>
  FlowPlay.toSolutionMsgs({
    flow: puzzle.flow
  }).map(
    (c): FixtureUpdateInput => ({
      msgCore: withEventMeta({
        t: 'got-flow-play-msg',
        c
      })
    })
  )

export const FixtureScreenPlayPuzzleClient = async () => {
  const f = await FixtureFlowPlayClient()
  const puzzle = await FlowPuzzle.random()
  const nextPuzzle = await FlowPuzzle.random()
  const prevPuzzle = await FlowPuzzle.random()

  const nextPuzzleResult: FlowPuzzleResult = { t: 'got', c: nextPuzzle }
  const prevPuzzleResult: FlowPuzzleResult = { t: 'got', c: prevPuzzle }

  const pack = await FlowPack.random({
    puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id]
  })
  const puzzleIndex = 1
  const prevPuzzleIndex = 0
  const nextPuzzleIndex = 2

  f.initial.model = {
    ...f.initial.model,
    flowPuzzles: {
      [puzzle.id]: puzzle,
      [nextPuzzle.id]: nextPuzzle,
      [prevPuzzle.id]: prevPuzzle
    },
    flowPacks: {
      [pack.id]: pack
    }
  }

  const init = f.update(f.initial, [
    {
      msg: {
        t: 'user-clicked-open-pack-list-item',
        pack
      }
    },
    {
      msg: {
        t: 'user-clicked-open-puzzle-grid-item',
        flowPuzzle: { t: 'got', c: puzzle },
        puzzleIndex
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
