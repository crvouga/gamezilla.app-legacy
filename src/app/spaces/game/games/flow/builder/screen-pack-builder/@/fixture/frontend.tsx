import { Pack } from '../../../../@/pack/pack'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../../../@/fixture/frontend'
import { ScreenPackBuilderSpace } from '../../space'
import type { ModelFrontend, ModelSpace } from '../../types'

export const FixturePackBuilderFrontend = async () => {
  const f = await FixtureFlowBuilderFrontend()
  const puzzle = await Puzzle.random({ createdBy: f.ctx.currentUserId })
  const pack = await Pack.random({ createdBy: f.ctx.currentUserId, puzzleIds: [puzzle.id] })
  const ctxNew: typeof f.ctx = {
    ...f.ctx,
    puzzles: { ...f.ctx.puzzles, [puzzle.id]: puzzle },
    packs: { ...f.ctx.packs, [pack.id]: pack },
  }
  const model: ModelFrontend = { ...f.model }
  const modelSpace: ModelSpace = ScreenPackBuilderSpace.initSpace({ pack })

  return {
    ...f,
    ctx: ctxNew,
    pack,
    puzzle,
    model,
    modelSpace,
  }
}
