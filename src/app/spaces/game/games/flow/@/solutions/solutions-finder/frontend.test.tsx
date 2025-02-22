import { describe, test } from 'bun:test'
import { FixtureFlowFrontend } from '../../frontend/fixture'

export const Fixture = async () => {
  const f = await FixtureFlowFrontend()

  return {
    ...f,
  }
}

describe('SolutionsFinderFrontend', () => {
  test('should render', async () => {
    await Fixture()
  })
})
