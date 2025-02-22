import { describe, expect, test } from 'bun:test'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { FixtureFlowFrontend } from '../../frontend/fixture'
import { SolutionsFinderFrontend } from './frontend'

export const Fixture = async () => {
  const f = await FixtureFlowFrontend()

  return {
    ...f,
  }
}

describe.only('SolutionsFinderFrontend', () => {
  test('open dialog', async () => {
    const f = await Fixture()
    const before = SolutionsFinderFrontend.update({
      ...f,
      model: SolutionsFinderFrontend.init,
    })
    const after = SolutionsFinderFrontend.update({
      ...f,
      model: before.model,
      msg: { t: 'dialog.clicked-open' },
    })
    expect(before.model.open).toBe(null)
    expect(after.model.open).toBe('find-solutions-confirmation')
    expect(didPlaySound(after)).toBe(true)
  })

  test('close dialog', async () => {
    const f = await Fixture()
    const before = SolutionsFinderFrontend.update({
      ...f,
      model: SolutionsFinderFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    const after = SolutionsFinderFrontend.update({
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
    const actual = SolutionsFinderFrontend.update({
      ...f,
      model: SolutionsFinderFrontend.init,
      msgCmd: SolutionsFinderFrontend.gotMsg({ t: 'dialog.clicked-open' }),
    })
    const expected = SolutionsFinderFrontend.update({
      ...f,
      model: SolutionsFinderFrontend.init,
      msg: { t: 'dialog.clicked-open' },
    })
    expect(actual).toEqual(expected)
  })
})
