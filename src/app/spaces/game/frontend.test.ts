import { describe, expect, it } from 'bun:test'

import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'
import { SpacesCore } from '../core/core'
import { GameName } from './games/@/game-name'
import { NonEmpty } from '~/@/array/non-empty'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ExitGameCmd } from '../@/frontend/exit-game-cmd'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()

  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should play a sound after inputting a game', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'start-space.clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'game.clicked-game-tile',
          gameName: 'flow',
        },
      },
    ])
    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  it('should be able to start game', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const gameNameExpected: GameName = 'flow'
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'start-space.clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'game.clicked-game-tile',
          gameName: gameNameExpected,
        },
      },
    ])
    const gameName = SpacesCore.toSpaceStarted(output.model.spaces, spaceId)?.game?.t
    expect(gameName).toBe(gameNameExpected)
  })

  it('should exit game for corresponding cmd', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const outputs = f.updates(f.initial, [
      {
        msg: {
          t: 'start-space.clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'game.clicked-game-tile',
          gameName: 'flow',
        },
      },
      {
        msgIn: ExitGameCmd.init(),
      },
    ])

    const gameName = SpacesCore.toSpaceStarted(NonEmpty.last(outputs).model.spaces, spaceId)?.game?.t ?? null

    expect(gameName).toBeNull()
  })
})
