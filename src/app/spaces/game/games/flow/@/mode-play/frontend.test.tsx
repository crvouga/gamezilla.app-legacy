import { describe, expect, test } from 'bun:test'
import { ModePlay } from '.'
import { FixtureFlowFrontend } from '../frontend/fixture'
import { HintCalculatorFrontend } from '../solutions/hint-calculator/frontend'
import { VariantGridShorthand } from '../variant/grid'
import { ModePlayFrontend } from './frontend'
import { ModePlayFrontendCtx } from './frontend/ctx'
import { UseHintFrontend } from './use-hint/frontend'
import { Solutions } from '../solutions/solutions'
import { Solution } from '../solutions/solution'

const Fixture = async () => {
  const f = await FixtureFlowFrontend()
  const flow = VariantGridShorthand.toGrid([
    ['A', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', 'A'],
  ])
  const ctx: ModePlayFrontendCtx = { ...f.ctx, flow }
  const init = ModePlay.init({ ctx })
  const solutions = await Solutions.find({ logger: f.ctx.logger, models: [flow] })
  const ctxWithSolutions: ModePlayFrontendCtx = { ...ctx, solutions }
  const solution = solutions[0]
  if (!solution) throw new Error('No solution found')
  const modelSolved: ModePlay.Model = { ...init, ...Solution.toSolvedFlow(solution) }

  return {
    ...f,
    ctx,
    ctxWithSolutions,
    flow,
    init,
    solutions,
    modelSolved,
  }
}

describe.only('ModePlayFrontend', () => {
  test('screen actions show find solutions when no solutions are loaded', async () => {
    const f = await Fixture()
    const screenActions = ModePlayFrontend.viewActions({
      ctx: f.ctx,
      model: f.init,
      dispatch: () => {},
      dispatchCmd: () => {},
    })
    expect(screenActions.some(HintCalculatorFrontend.isFindSolutionsScreenAction)).toBe(true)
    expect(screenActions.some(UseHintFrontend.isAction)).toBe(false)
  })
  test('screen actions show use hint when solutions are loaded', async () => {
    const f = await Fixture()
    const screenActions = ModePlayFrontend.viewActions({
      ctx: f.ctxWithSolutions,
      model: f.init,
      dispatch: () => {},
      dispatchCmd: () => {},
    })
    expect(screenActions.some(HintCalculatorFrontend.isFindSolutionsScreenAction)).toBe(false)
    expect(screenActions.some(UseHintFrontend.isAction)).toBe(true)
  })

  test('remove hint button when puzzle is solved', async () => {
    const f = await Fixture()
    const screenActions = ModePlayFrontend.viewActions({
      ctx: f.ctxWithSolutions,
      model: f.modelSolved,
      dispatch: () => {},
      dispatchCmd: () => {},
    })
    expect(screenActions.some(UseHintFrontend.isAction)).toBe(false)
  })
})
