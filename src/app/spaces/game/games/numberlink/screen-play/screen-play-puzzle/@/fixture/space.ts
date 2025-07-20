import { NonEmpty } from '~/@/array/non-empty'
import { pipe } from '~/@/function/pipe'
import { UserId } from '~/app/@/data/user-id'
import { Pack } from '../../../../@/pack/pack'
import { ModePlay } from '../../../../@/mode-play'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { PuzzleResult } from '../../../../@/puzzle/puzzle-result'
import { Solutions } from '../../../../@/solutions/solutions'
import { NumberlinkSpaceCtx } from '../../../../@/space/ctx'
import type { NumberlinkVariant } from '../../../../@/variant'
import { NumberlinkPlaySpaceFixture } from '../../../@/space/fixture'
import { ScreenPlayPuzzleSpace } from '../../space'
import type { ModelSpace, MsgSpace } from '../../types'
import { Logger } from '~/@/logger'

export const FixtureScreenPuzzlePlaySpace = async (input?: { numberlink?: NumberlinkVariant.Model }) => {
  const f = await NumberlinkPlaySpaceFixture()
  const puzzle = await Puzzle.random({ numberlink: input?.numberlink })
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

  const solutions = await Solutions.find({
    models: [prevPuzzle, puzzle, nextPuzzle].map((p) => p.model),
    logger: Logger.init({ t: 'noop' }),
  })

  const ctx: NumberlinkSpaceCtx = {
    ...f.ctx,
  }

  const init = f.update(f.init, [
    {
      t: 'user-clicked-open-pack-puzzle-grid-item',
      pack,
      userId: f.hostId,
    },
    {
      t: 'user-clicked-open-screen-play-puzzle',
      puzzle: { t: 'got', c: puzzle },
      puzzleIndex,
      userId: f.hostId,
    },
  ])

  const userId = UserId.generate()
  const solvePuzzleMsgs = pipe(ModePlay.toSolutionMsgs({ numberlink: puzzle.model }), (msgs) =>
    msgs.map((c): MsgSpace => ({ userId, t: 'got-numberlink-play-msg', c })),
  )

  return {
    ...f,
    solutions,
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

export const FixtureScreenPuzzlePlaySpaceChild = async (input?: { numberlink?: NumberlinkVariant.Model }) => {
  const f = await FixtureScreenPuzzlePlaySpace(input)

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
    pack: f.pack,
    puzzle: { t: 'got', c: f.puzzle },
    puzzleIndex: f.puzzleIndex,
  })

  return {
    ...f,
    parent: f,
    updates,
    update,
    init,
  }
}
