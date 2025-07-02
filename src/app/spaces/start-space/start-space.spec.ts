import { difference } from '~/@/array/difference'
import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureSpacesE2E } from '../@/fixture/e2e'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureSpacesE2E(e)
  return {
    ...f,
  }
}

describe('start space', () => {
  test('click start space button', async (e) => {
    await using f = await Fixture(e)
    const [spaceSpaceFab] = await f.frontend.query(`[data-fab='true']`)
    await spaceSpaceFab!.do({ t: 'click' })
    const [screen] = await f.frontend.query(`[data-testid='spaces/space-screen']`)
    expect(screen).toBeTruthy()
  })

  test('play sound', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    const before = await f.frontend.audio()
    const [spaceSpaceFab] = await f.frontend.query(`[data-fab='true']`)
    await spaceSpaceFab!.do({ t: 'click' })
    await eventually(async () => {
      const after = await f.frontend.audio()
      const sound = new Set(difference(after, before, (s) => s.id).map((s) => s.tag))
      expect(sound.has('interaction.navigate')).toEqual(true)
    })
  })
})
