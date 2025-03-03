import { describe, expect, test } from 'bun:test'
import { Err, Ok } from '~/@/result'
import { didPlaySound, didShowErrorSm, didShowToast } from '~/app/@/frontend/cmd'
import { FixtureFlowFrontend } from '../../frontend/fixture'
import { VariantGridShorthand } from '../../variant/grid'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'
import { HintLoaderFrontend } from './frontend'

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

describe.only('HintLoaderFrontend', () => {
  test('open dialog', async () => {
    const f = await Fixture()
    const before = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
    })
    const after = HintLoaderFrontend.update({
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
    const before = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    const after = HintLoaderFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'dialog.clicked-open' },
    })
    expect(before.model.open).toBe('find-solutions-confirmation')
    expect(after.model.open).toBe(null)
  })

  test('close dialog', async () => {
    const f = await Fixture()
    const before = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    const after = HintLoaderFrontend.update({
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
    const actual = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
      msgCmd: HintLoaderFrontend.gotMsg({ t: 'dialog.clicked-open' }),
    })
    const expected = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    expect(actual).toEqual(expected)
  })

  test('clicked find solutions', async () => {
    const f = await Fixture()

    const before = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })

    const after = HintLoaderFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'clicked-find-solutions', flow: f.flow },
    })
    expect(HintLoaderFrontend.isLoading(after.model, f.hash)).toBe(true)
    expect(didPlaySound(after)).toBe(true)
    expect(after.eff).not.toBeUndefined()
  })

  test('found solution ok', async () => {
    const f = await Fixture()

    const before = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
      msg: { t: 'clicked-find-solutions', flow: f.flow },
    })
    const after = HintLoaderFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'found-solution', flow: f.flow, found: Ok({ solutions: f.solutions }) },
    })
    expect(HintLoaderFrontend.isLoading(after.model, f.hash)).toBe(false)
    expect(after.model.open).toBe(null)
    expect(didPlaySound(after)).toBe(true)
    expect(didShowToast(after)).toBe(true)
  })

  test('found solution err', async () => {
    const f = await Fixture()
    const before = HintLoaderFrontend.update({
      ...f,
      model: HintLoaderFrontend.init,
      msg: { t: 'clicked-find-solutions', flow: f.flow },
    })
    const after = HintLoaderFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'found-solution', flow: f.flow, found: Err('some error') },
    })
    expect(HintLoaderFrontend.isLoading(after.model, f.hash)).toBe(false)
    expect(after.model.open).toBe(null)
    expect(didShowErrorSm(after)).toBe(true)
  })
})
