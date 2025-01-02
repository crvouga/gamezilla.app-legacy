import { Sub } from '~/@/sub'
import { GameServerModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { ServerModule } from './types'
import { ScreenPlayPuzzleServer } from './screen-play-puzzle/server'

const init: ServerModule['init'] = async () => {
  return {
    model: {}
  }
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => ScreenPlayPuzzleServer.update(input))
}

const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

export const PlayServer = {
  init,
  update,
  subscriptions
}
