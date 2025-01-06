import { describe, it } from 'bun:test'
import { FixturePlayClient } from './@/client/fixture'

const Fixture = async () => {
  const f = await FixturePlayClient()
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
