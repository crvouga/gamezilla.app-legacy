import { describe, test } from 'bun:test'
import { GameBackendModule } from '../../../@/architecture/game-backend-v2'
import { FixturePlayBackend } from '../@/backend/fixture'
import { ScreenPlayPuzzleSpace } from './space'
import { ScreenPlayPuzzleBackend } from './backend'

const Fixture = async () => {
  const f = await FixturePlayBackend()

  const update = GameBackendModule.fixtureUpdate({
    ctx: f.ctx,
    update: ScreenPlayPuzzleBackend.update,
    updateSpace: ScreenPlayPuzzleSpace.updateSpace,
    modelSpace: f.initial.modelSpace,
  })

  return {
    ...f,
    update,
  }
}

describe(import.meta.file, () => {
  test.todo('record user completed puzzle', async () => {
    const f = await Fixture()
    f
  })
})
