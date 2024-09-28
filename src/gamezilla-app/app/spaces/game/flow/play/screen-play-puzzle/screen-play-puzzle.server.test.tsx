import { describe, test } from 'bun:test'
import { FixtureFlowPlayServer } from '../@/fixture.server'
import { GameServerModule } from '../../../@/architecture/game-server-v2'
import { ScreenPlayPuzzleServer } from './screen-play-puzzle.server'
import { ScreenPlayPuzzleCore } from './screen-play-puzzle.core'

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
