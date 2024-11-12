import { describe, it } from 'bun:test'
import { FixtureSpaceServer } from '../@/fixture/server'

const Fixture = async () => {
  const f = await FixtureSpaceServer()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it('should list spaces when requested', async () => {
    const f = await Fixture()
    f
    // f.update([
    //   {
    //     msg
    //   }
    // ])
  })
  it.todo('should include the started space in the response', async () => {})
})
