import { describe, it } from 'bun:test'
import { FixturePlayFrontend } from './@/frontend/fixture'

const Fixture = async () => {
  const f = await FixturePlayFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should fetch puzzles in pack when on puzzle screen', async () => {
    const f = await Fixture()
    f
    //
  })
})
