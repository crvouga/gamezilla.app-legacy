import { NonEmpty } from '~/@/array/non-empty'
import { WithEventMeta } from '~/@/event-sourced/event'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import type { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { PackLoaderTypes } from '../../../@/pack/pack-loader'
import { PackDb } from '../../../@/pack/pack-db/impl'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'
import { PuzzleLoaderTypes } from '../../../@/puzzle/puzzle-loader'
import { Solutions } from '../../../@/solutions/solutions'
import { BuildFrontend } from '../../frontend'
import { BuildSpace } from '../../space'
import * as BuilderTypes from '../../types'

export type FixtureUpdateInput = {
  ctx?: FlowFrontendCtx
  msg?: BuilderTypes.MsgFrontend
  msgSpace?: WithEventMeta<BuilderTypes.MsgSpace>
  msgBackend?: BuilderTypes.MsgToFrontend
}
export type FixtureUpdateOutput = ReturnType<typeof BuildFrontend.update> & {
  modelSpace: BuilderTypes.ModelSpace
}

const toModelSpace = (
  ctx: FlowFrontendCtx,
  initial: BuilderTypes.ModelSpace,
  msgSpaces: BuilderTypes.MsgSpace[],
): BuilderTypes.ModelSpace => {
  return msgSpaces.reduce((modelSpace, msgSpace) => BuildSpace.updateSpace({ ctx, modelSpace, msgSpace }), initial)
}

export const FixtureFlowBuilderFrontend = async () => {
  const f = await FixtureSpacesFrontend()
  const ctx: FlowFrontendCtx = {
    ...f.ctx,
    puzzles: {},
    packs: {},
    puzzleDbQuery: PuzzleLoaderTypes.initFrontend,
    packDbQuery: PackLoaderTypes.initFrontend,
    solutions: Solutions.init,
    puzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: f.ctx.dbConnSql, logger: f.ctx.logger }),
    packDb: PackDb({ t: 'db-conn-sql', dbConnSql: f.ctx.dbConnSql, logger: f.ctx.logger }),
  }
  const model = BuilderTypes.initFrontend
  const modelSpace = BuildSpace.initSpace({ ctx })
  const init = {
    ctx,
    model,
    modelSpace,
  }

  const updatesReducer = (outputs: NonEmpty<FixtureUpdateOutput>, input: FixtureUpdateInput) => {
    const ctx = input.ctx ?? init.ctx
    const output = BuildFrontend.update({
      ...input,
      model: NonEmpty.last(outputs).model,
      modelSpace: NonEmpty.last(outputs).modelSpace,
      ctx,
    })
    const modelSpaceOutput = toModelSpace(ctx, NonEmpty.last(outputs).modelSpace, output.msgSpace ?? [])
    outputs.push({
      ...output,
      modelSpace: modelSpaceOutput,
    })
    return outputs
  }

  const updates = (init: FixtureUpdateOutput, inputs: FixtureUpdateInput[]): NonEmpty<FixtureUpdateOutput> => {
    return inputs.reduce(updatesReducer, [
      {
        model: init.model,
        modelSpace: init.modelSpace,
      },
    ])
  }

  const update = (init: FixtureUpdateOutput, inputs: FixtureUpdateInput[]): FixtureUpdateOutput => {
    const outputs = updates(init, inputs)
    return NonEmpty.last(outputs)
  }

  return {
    ...f,
    init,
    ctx,
    model,
    modelSpace,
    update,
    updates,
  }
}

export const initial = {
  model: BuilderTypes.initFrontend,
}
