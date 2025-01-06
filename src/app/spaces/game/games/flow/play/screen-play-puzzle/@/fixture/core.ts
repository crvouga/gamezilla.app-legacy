import { NonEmpty } from '~/@/array/non-empty'
import { pipe } from '~/@/function/pipe'
import { UserId } from '~/app/@/data/user-id'
import type { Variant } from '../../../../@/flow'
import { FlowPlay } from '../../../../@/flow/flow-play'
import { Pack } from '../../../../@/pack/pack'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { PuzzleResult } from '../../../../@/puzzle/puzzle-result'
import { CoreFixture } from '../../../@/core/fixture'
import { ScreenPlayPuzzleCore } from '../../core'
import type { ModelCore, MsgCore } from '../../types'

export const ScreenPuzzlePlayCoreFixture = async (input?: { flow?: Variant.Model }) => {
  const f = await CoreFixture()
  const puzzle = await Puzzle.random(input)
  const puzzleIndex = 1
  const prevPuzzle = await Puzzle.random()
  const prevPuzzleResult: PuzzleResult = { t: 'got', c: prevPuzzle }
  const prevPuzzleIndex = 0
  const nextPuzzle = await Puzzle.random()
  const nextPuzzleResult: PuzzleResult = { t: 'got', c: nextPuzzle }
  const nextPuzzleIndex = 2
  const pack = await Pack.random({
    puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id],
  })

  const init = f.update(f.init, [
    {
      t: 'user-clicked-open-pack-list-item',
      pack,
    },
    {
      t: 'user-clicked-open-puzzle-grid-item',
      flowPuzzle: { t: 'got', c: puzzle },
      puzzleIndex,
    },
  ])

  const userId = UserId.generate()
  const solvePuzzleMsgs = pipe(FlowPlay.toSolutionMsgs(puzzle), (msgs) =>
    msgs.map(
      (c): MsgCore => ({
        userId,
        t: 'got-flow-play-msg',
        c,
      }),
    ),
  )

  return {
    ...f,
    solvePuzzleMsgs,
    puzzle,
    puzzleIndex,
    nextPuzzle: nextPuzzleResult,
    nextPuzzleIndex,
    prevPuzzle: prevPuzzleResult,
    prevPuzzleIndex,
    pack,
    init,
  }
}

export const ScreenPuzzlePlayCoreChildFixture = async (input?: { flow?: Variant.Model }) => {
  const f = await ScreenPuzzlePlayCoreFixture(input)

  const updates = (
    init: ModelCore,
    msgs: MsgCore[],
  ): NonEmpty<ReturnType<typeof ScreenPlayPuzzleCore.updateScreen>> => {
    const models: NonEmpty<ModelCore> = [init]
    for (const msg of msgs) {
      const last = NonEmpty.last(models)
      const latest = ScreenPlayPuzzleCore.updateScreen(last, msg)
      models.push(latest)
    }
    return models
  }

  const update = (init: ModelCore, msgs: MsgCore[]): ReturnType<typeof ScreenPlayPuzzleCore.updateScreen> => {
    const outputs = updates(init, msgs)
    return NonEmpty.last(outputs)
  }

  const init: ModelCore = ScreenPlayPuzzleCore.initCore({
    flowPack: f.pack,
    flowPuzzle: { t: 'got', c: f.puzzle },
    puzzleIndex: f.puzzleIndex,
  })

  return {
    ...f,
    updates,
    initParent: f.init,
    updateParent: f.update,
    update,
    init,
  }
}
