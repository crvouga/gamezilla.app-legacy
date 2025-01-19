import { describe, it } from 'bun:test'
import { FixtureFlowBuilderFrontend } from '../@/fixture/frontend'

const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()

  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it.todo('should update pack when pack changes in model sync', async () => {
    await Fixture()
  })
})
