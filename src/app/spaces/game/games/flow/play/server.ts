import { Sub } from '~/@/sub'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { BackendModule } from './types'
import { ScreenPlayPuzzleBackend } from './screen-play-puzzle/server'

const init: BackendModule['init'] = async () => {
  return {
    model: {},
  }
}

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => ScreenPlayPuzzleBackend.update(input))
}

const subscriptions: BackendModule['subscriptions'] = async () => {
  return Sub.None
}

export const PlayBackend = {
  init,
  update,
  subscriptions,
}
