import { describe, expect, test } from 'bun:test'
import { ModePlay } from '.'
import { FixtureFlowFrontend } from '../frontend/fixture'
import { HintCalculatorFrontend } from '../solutions/hint-calculator/frontend'
import { VariantGridShorthand } from '../variant/grid'
import { ModePlayFrontend } from './frontend'
import { ModePlayFrontendCtx } from './frontend/ctx'
import { UseHintFrontend } from './use-hint/frontend'
import { Solutions } from '../solutions/solutions'

const Fixture = async () => {
  const f = await FixtureFlowFrontend()
  const flow = VariantGridShorthand.toGrid([
    ['A', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', 'A'],
  ])
  const ctx: ModePlayFrontendCtx = {
    ...f.ctx,
    flow,
  }
  const init = ModePlay.init({
    ctx,
  })
  return {
    ...f,
    ctx,
    flow,
    init,
  }
}

describe('ModePlayFrontend', () => {
  test('screen actions show find solutions when no solutions are loaded', async () => {
    const f = await Fixture()
    const screenActions = ModePlayFrontend.viewActions({
      ctx: f.ctx,
      model: f.init,
      dispatch: () => {},
      dispatchHintCalculator: () => {},
    })
    expect(screenActions.some(HintCalculatorFrontend.isFindSolutionsScreenAction)).toBe(true)
    expect(screenActions.some(UseHintFrontend.isUseHintScreenAction)).toBe(false)
  })
  test('screen actions show use hint when solutions are loaded', async () => {
    const f = await Fixture()
    const ctxWithSolutions: ModePlayFrontendCtx = {
      ...f.ctx,
      solutions: await Solutions.find({ logger: f.ctx.logger, models: [f.flow] }),
    }
    const screenActions = ModePlayFrontend.viewActions({
      ctx: ctxWithSolutions,
      model: f.init,
      dispatch: () => {},
      dispatchHintCalculator: () => {},
    })
    expect(screenActions.some(HintCalculatorFrontend.isFindSolutionsScreenAction)).toBe(false)
    expect(screenActions.some(UseHintFrontend.isUseHintScreenAction)).toBe(true)
  })
})
