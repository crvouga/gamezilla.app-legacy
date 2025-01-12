import { NonEmpty } from '~/@/array/non-empty'
import { pipe } from '~/@/function/pipe'
import { UserId } from '~/app/@/data/user-id'
import { Pack } from '../../../../@/pack/pack'
import { PlayMode } from '../../../../@/play-mode'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { PuzzleResult } from '../../../../@/puzzle/puzzle-result'
import type { Variant } from '../../../../@/variant'
import { SpaceFixture } from '../../../@/space/fixture'
import { ScreenPlayPuzzleSpace } from '../../space'
import type { ModelSpace, MsgSpace } from '../../types'
import { Solutions } from '../../../../@/solutions/solutions'
import { FlowSpaceCtx } from '../../../../@/space/ctx'

export const ScreenPuzzlePlaySpaceFixture = async (input?: { flow?: Variant.Model }) => {
  const f = await SpaceFixture()
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

  const solutions = await Solutions.find([prevPuzzle, puzzle, nextPuzzle].map((p) => p.flow))

  const ctx: FlowSpaceCtx = {
    ...f.ctx,
    solutions,
  }

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
  const solvePuzzleMsgs = pipe(PlayMode.toSolutionMsgs(puzzle), (msgs) =>
    msgs.map((c): MsgSpace => ({ userId, t: 'got-flow-play-msg', c })),
  )

  return {
    ...f,
    ctx,
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

export const ScreenPuzzlePlaySpaceChildFixture = async (input?: { flow?: Variant.Model }) => {
  const f = await ScreenPuzzlePlaySpaceFixture(input)

  const updates = (
    init: ModelSpace,
    msgs: MsgSpace[],
  ): NonEmpty<ReturnType<typeof ScreenPlayPuzzleSpace.updateScreen>> => {
    const models: NonEmpty<ModelSpace> = [init]
    for (const msg of msgs) {
      const last = NonEmpty.last(models)
      const latest = ScreenPlayPuzzleSpace.updateScreen({ ctx: f.ctx, modelSpace: last, msgSpace: msg })
      models.push(latest)
    }
    return models
  }

  const update = (init: ModelSpace, msgs: MsgSpace[]): ReturnType<typeof ScreenPlayPuzzleSpace.updateScreen> => {
    const outputs = updates(init, msgs)
    return NonEmpty.last(outputs)
  }

  const init: ModelSpace = ScreenPlayPuzzleSpace.initSpace({
    ctx: f.ctx,
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
