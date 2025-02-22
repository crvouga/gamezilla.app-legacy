import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Pack } from '../../../../../@/pack/pack'
import { Puzzle } from '../../../../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../../../../@/fixture/frontend'
import { ScreenPackBuilderFrontend } from '../../frontend'
import { ScreenPackBuildSpace } from '../../space/space'
import type { ModelFrontend, ModelSpace } from '../../types'

export type UpdateInput = Partial<Parameters<typeof ScreenPackBuilderFrontend.update>[0]>
export type UpdateOutput = ReturnType<typeof ScreenPackBuilderFrontend.update>

export const FixturePackBuilderFrontend = async () => {
  const f = await FixtureFlowBuilderFrontend()
  const puzzle = await Puzzle.random({ createdBy: f.ctx.currentUserId })
  const pack = await Pack.random({ createdBy: f.ctx.currentUserId, puzzleIds: [puzzle.id] })
  const ctx: typeof f.ctx = {
    ...f.ctx,
    puzzles: { ...f.ctx.puzzles, [puzzle.id]: puzzle },
    packs: { ...f.ctx.packs, [pack.id]: pack },
  }
  const model: ModelFrontend = { ...f.model }
  const modelSpace: ModelSpace = ScreenPackBuildSpace.initSpace({ pack })
  const initial: UpdateOutput = {
    model,
  }
  const update = (acc: UpdateOutput, [input, ...inputs]: UpdateInput[]): UpdateOutput => {
    if (!input) return acc

    const modelSpace = (acc.msgSpace ?? []).reduce(
      (acc, m) => ScreenPackBuildSpace.updateSpace({ ...input, modelSpace: acc, msgSpace: m, ctx }),
      ScreenPackBuildSpace.initSpace({ pack }),
    )

    const output = ScreenPackBuilderFrontend.update({ ...input, ctx: ctx, model: acc.model, modelSpace })

    const outputNew: UpdateOutput = {
      model: output.model,
      eff: Eff.batch(acc.eff, output.eff),
      msgCmd: Msg.batch(acc?.msgCmd, output.msgCmd),
      msgEvt: Msg.batch(acc?.msgEvt, output.msgEvt),
      msgSpace: Msg.batch(acc?.msgSpace, output.msgSpace),
    }

    return update(outputNew, inputs)
  }

  return {
    ...f,
    update,
    initial,
    ctx: ctx,
    pack,
    puzzle,
    model,
    modelSpace,
  }
}
