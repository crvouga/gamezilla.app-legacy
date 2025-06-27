// import { NonEmpty } from '~/@/array/non-empty'
// import { WithEventMeta } from '~/@/event-sourced/event'
// import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
// import type { FlowFrontendCtx } from '../../../@/frontend/ctx'
// import { PackDb } from '../../../@/pack/pack-db/impl'
// import { PackLoaderTypes } from '../../../@/pack/pack-loader'
// import { PuzzleDb } from '../../../@/puzzle/puzzle-db'
// import { PuzzleLoaderTypes } from '../../../@/puzzle/puzzle-loader'
// import { Solutions } from '../../../@/solutions/solutions'
// import { SolutionsDb } from '../../../@/solutions/solutions-db/impl-sql-db'
// import { HintCalculatorTypes } from '../../../@/solutions/hint-calculator'
// import { SolutionsLoaderTypes } from '../../../@/solutions/solutions-loader'
// import { ScreenBuildFrontend } from '../../frontend'
// import { BuildSpace } from '../../space'
// import * as BuilderTypes from '../../types'

// export type FixtureUpdateInput = {
//   ctx?: FlowFrontendCtx
//   msg?: BuilderTypes.MsgFrontend
//   msgSpace?: WithEventMeta<BuilderTypes.MsgSpace>
// }

// export type FixtureUpdateOutput = ReturnType<typeof ScreenBuildFrontend.update> & {
//   modelSpace: BuilderTypes.ModelSpace
// }

// const toModelSpace = (
//   ctx: FlowFrontendCtx,
//   initial: BuilderTypes.ModelSpace,
//   msgSpaces: BuilderTypes.MsgSpace[],
// ): BuilderTypes.ModelSpace => {
//   return msgSpaces.reduce((modelSpace, msgSpace) => BuildSpace.updateSpace({ ctx, modelSpace, msgSpace }), initial)
// }

// export const FixtureFlowBuilderFrontend = async () => {
//   const f = await FixtureSpacesFrontend()
//   // @ts-ignore
//   const ctx: FlowFrontendCtx = {
//     ...f.ctx,
//     puzzles: {},
//     packs: {},
//     puzzleLoader: PuzzleLoaderTypes.initFrontend,
//     packLoader: PackLoaderTypes.initFrontend,
//     hintCalculator: HintCalculatorTypes.initFrontend,
//     solutionsLoader: SolutionsLoaderTypes.initFrontend,
//     solutions: Solutions.init,
//     puzzleDb: PuzzleDb({ t: 'sql-db', sqlDb: f.ctx.sqlDb, logger: f.ctx.logger }),
//     packDb: PackDb({ t: 'sql-db', sqlDb: f.ctx.sqlDb, logger: f.ctx.logger }),
//     solutionsDb: SolutionsDb({ t: 'sql-db', sqlDb: f.ctx.sqlDb }),
//   }
//   const model = BuilderTypes.initFrontend
//   const modelSpace = BuildSpace.initSpace({ ctx })
//   const init = {
//     ctx,
//     model,
//     modelSpace,
//   }

//   const updatesReducer = (outputs: NonEmpty<FixtureUpdateOutput>, input: FixtureUpdateInput) => {
//     const ctx = input.ctx ?? init.ctx
//     const output = ScreenBuildFrontend.update({
//       ...input,
//       model: NonEmpty.last(outputs).model,
//       modelSpace: NonEmpty.last(outputs).modelSpace,
//       ctx,
//     })
//     const modelSpaceOutput = toModelSpace(ctx, NonEmpty.last(outputs).modelSpace, output.msgSpace ?? [])
//     outputs.push({
//       ...output,
//       modelSpace: modelSpaceOutput,
//     })
//     return outputs
//   }

//   const updates = (init: FixtureUpdateOutput, inputs: FixtureUpdateInput[]): NonEmpty<FixtureUpdateOutput> => {
//     return inputs.reduce(updatesReducer, [
//       {
//         model: init.model,
//         modelSpace: init.modelSpace,
//       },
//     ])
//   }

//   const update = (init: FixtureUpdateOutput, inputs: FixtureUpdateInput[]): FixtureUpdateOutput => {
//     const outputs = updates(init, inputs)
//     return NonEmpty.last(outputs)
//   }

//   return {
//     ...f,
//     init,
//     ctx,
//     model,
//     modelSpace,
//     update,
//     updates,
//   }
// }

// export const initial = {
//   model: BuilderTypes.initFrontend,
// }
