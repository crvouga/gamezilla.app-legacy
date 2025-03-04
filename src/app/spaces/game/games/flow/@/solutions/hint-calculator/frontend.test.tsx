import { describe, expect, test } from 'bun:test'
import { Err, Ok } from '~/@/result'
import { didPlaySound, didShowErrorSm, didShowOkSm, didShowWarningSm } from '~/app/@/frontend/cmd'
import { FixtureFlowFrontend } from '../../frontend/fixture'
import { VariantGridShorthand } from '../../variant/grid'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'
import { HintCalculatorFrontend } from './frontend'

export const Fixture = async () => {
  const f = await FixtureFlowFrontend()

  const flow = VariantGridShorthand.toGrid([
    ['A', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', 'A'],
  ])

  const solutions = await Solutions.find({ logger: f.ctx.logger, models: [flow] })
  const hash = SolutionHash.init(flow)
  const solution = Solutions.selectOne(solutions, hash)
  if (!solution) throw new Error('No solution found')
  return {
    ...f,
    flow,
    hash,
    solutions,
    solution,
  }
}

describe.only('HintCalculatorFrontend', () => {
  test('open dialog', async () => {
    const f = await Fixture()
    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
    })
    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'dialog.clicked-open' },
    })
    expect(before.model.open).toBe(null)
    expect(after.model.open).toBe('find-solutions-confirmation')
    expect(didPlaySound(after)).toBe(true)
  })

  test('toggle open dialog', async () => {
    const f = await Fixture()
    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'dialog.clicked-open' },
    })
    expect(before.model.open).toBe('find-solutions-confirmation')
    expect(after.model.open).toBe(null)
  })

  test('close dialog', async () => {
    const f = await Fixture()
    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'dialog.clicked-close' },
    })
    expect(before.model.open).toBe('find-solutions-confirmation')
    expect(after.model.open).toBeNull()
    expect(didPlaySound(after)).toBe(true)
  })

  test('handle got msg cmd', async () => {
    const f = await Fixture()
    const actual = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msgCmd: HintCalculatorFrontend.gotMsg({ t: 'dialog.clicked-open' }),
    })
    const expected = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    expect(actual).toEqual(expected)
  })

  test('clicked find solutions', async () => {
    const f = await Fixture()

    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })

    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'clicked-find-solutions', flow: f.flow },
    })
    expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(true)
    expect(didPlaySound(after)).toBe(true)
    expect(after.eff).not.toBeUndefined()
  })

  test('found solution ok', async () => {
    const f = await Fixture()

    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'clicked-find-solutions', flow: f.flow },
    })
    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'found-solution', flow: f.flow, found: Ok({ solutions: f.solutions }) },
    })
    expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(false)
    expect(after.model.open).toBe(null)
    expect(didShowOkSm(after)).toBe(true)
  })

  test('found no solutions', async () => {
    const f = await Fixture()

    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'clicked-find-solutions', flow: f.flow },
    })
    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'found-solution', flow: f.flow, found: Ok({ solutions: Solutions.init }) },
    })
    expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(false)
    expect(after.model.open).toBe(null)
    expect(didShowWarningSm(after)).toBe(true)
  })

  test('found solution err', async () => {
    const f = await Fixture()
    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'clicked-find-solutions', flow: f.flow },
    })
    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'found-solution', flow: f.flow, found: Err('some error') },
    })
    expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(false)
    expect(after.model.open).toBe(null)
    expect(didShowErrorSm(after)).toBe(true)
  })

  test('close surface after finding solutions', async () => {
    const f = await Fixture()

    const before = HintCalculatorFrontend.update({
      ...f,
      model: HintCalculatorFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    const after = HintCalculatorFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'found-solution', flow: f.flow, found: Ok({ solutions: f.solutions }) },
    })
    expect(before.model.open).toBe('find-solutions-confirmation')
    expect(after.model.open).toBe(null)
    expect(didPlaySound(after)).toBe(true)
  })
})
