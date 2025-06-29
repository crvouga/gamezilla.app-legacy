import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import * as StatusBar from './status-bar'

type Input = Partial<Parameters<typeof StatusBar.update>[0]>
type Output = ReturnType<typeof StatusBar.update>

const Fixture = async () => {
  const f = await FixtureAppFrontend()

  const init = StatusBar.init()

  const update = (acc: Output, [input, ...inputs]: Input[]) => {
    if (!input) return acc
    const output = StatusBar.update({ ...input, model: acc.model })
    return update(output, inputs)
  }

  return {
    ...f,
    init,
    update,
  }
}

describe('StatusBar', () => {
  test('should open status bar on click', async () => {
    const f = await Fixture()
    const before = f.init
    const after = f.update(before, [{ msg: { t: 'clicked-status-bar' } }])
    expect(before.model.isOpen).toEqual(false)
    expect(after.model.isOpen).toEqual(true)
  })

  test('should close status bar on click when open', async () => {
    const f = await Fixture()
    const before = f.update(f.init, [{ msg: { t: 'clicked-status-bar' } }])
    const after = f.update(before, [{ msg: { t: 'clicked-status-bar' } }])
    expect(before.model.isOpen).toEqual(true)
    expect(after.model.isOpen).toEqual(false)
  })
})
