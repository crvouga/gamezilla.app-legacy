// import { describe, expect, test } from 'bun:test'
// import { ModePlay } from '.'
// import { AlgoIsSolved } from '../solutions/algo-is-solved/algo-is-solved'
// import { HintCalculatorFrontend } from '../solutions/hint-calculator/frontend'
// import { Solution } from '../solutions/solution'
// import { Solutions } from '../solutions/solutions'
// import { VariantGridShorthand } from '../variant/grid'
// import { ModePlayFrontend } from './frontend'
// import { ModePlayFrontendCtx } from './frontend/ctx'
// import { UseHintFrontend } from './use-hint/frontend'
// import { FixtureNumberlinkFrontend } from '../frontend/fixture'

// const Fixture = async () => {
//   const f = await FixtureNumberlinkFrontend()
//   const numberlink = VariantGridShorthand.toGrid([
//     ['A', ' ', ' '],
//     [' ', ' ', ' '],
//     [' ', ' ', 'A'],
//   ])
//   const ctx: ModePlayFrontendCtx = { ...f.ctx, numberlink }
//   const init = ModePlay.init({ ctx })
//   const solutions = await Solutions.find({ logger: f.ctx.logger, models: [numberlink] })
//   const ctxWithSolutions: ModePlayFrontendCtx = { ...ctx, solutions }
//   const solution = solutions[0]
//   if (!solution) throw new Error('No solution found')
//   const modelSolved: ModePlay.Model = { ...init, ...Solution.toSolvedNumberlink(solution) }

//   if (!AlgoIsSolved.isSolved(ModePlay.toNumberlink(modelSolved, numberlink))) throw new Error('Model is not solved')

//   const render = (input?: Partial<Parameters<typeof ModePlayFrontend.TestView>[0]>) => {
//     const r = f.render(
//       <ModePlayFrontend.TestView dispatch={() => {}} dispatchCmd={() => {}} ctx={ctx} model={init} {...input} />,
//     )
//     return r
//   }

//   return {
//     ...f,
//     render,
//     ctx,
//     ctxWithSolutions,
//     numberlink,
//     init,
//     solutions,
//     modelSolved,
//   }
// }

// describe('ModePlayFrontend', () => {
//   test.todo('screen actions show find solutions when no solutions are loaded', async () => {
//     const f = await Fixture()
//     const r = f.render()
//     expect(r.getByTestId(HintCalculatorFrontend.TEST_ID_HINT_CALCULATOR_ACTION)[0]).toBeTruthy()
//     expect(r.getByTestId(UseHintFrontend.TEST_ID_USE_HINT_ACTION)[0]).toBeFalsy()
//   })

//   test('screen actions show use hint when solutions are loaded', async () => {
//     const f = await Fixture()
//     const r = f.render({ ctx: f.ctxWithSolutions })
//     expect(r.getByTestId(HintCalculatorFrontend.TEST_ID_HINT_CALCULATOR_ACTION)[0]).toBeFalsy()
//     expect(r.getByTestId(UseHintFrontend.TEST_ID_USE_HINT_ACTION)[0]).toBeTruthy()
//   })

//   test('disable hint button when puzzle is solved', async () => {
//     const f = await Fixture()
//     const r = f.render({ ctx: f.ctxWithSolutions, model: f.modelSolved })
//     expect(r.getByTestId(UseHintFrontend.TEST_ID_USE_HINT_ACTION)[0]?.disabled).toBe(true)
//   })
// })
