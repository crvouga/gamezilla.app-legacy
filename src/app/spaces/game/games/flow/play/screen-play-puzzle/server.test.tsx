import { describe, test } from 'bun:test'
import { GameServerModule } from '../../../@/architecture/game-server-v2'
import { FixtureFlowPlayServer } from '../@/server/fixture'
import { ScreenPlayPuzzleCore } from './core'
import { ScreenPlayPuzzleServer } from './server'

const Fixture = async () => {
  const f = await FixtureFlowPlayServer()

  const update = GameServerModule.fixtureUpdate({
    ctx: f.ctx,
    update: ScreenPlayPuzzleServer.update,
    updateCore: ScreenPlayPuzzleCore.updateCore,
    modelCore: f.initial.modelCore
  })

  return {
    ...f,
    update
  }
}

describe(import.meta.file, () => {
  test.todo('record user completed puzzle', async () => {
    const f = await Fixture()
    f
  })
})
