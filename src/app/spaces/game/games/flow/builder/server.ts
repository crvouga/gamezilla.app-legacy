import { Sub } from '~/@/sub'
import { GameServerModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { ScreenPackBuilderOpenServer } from './screen-pack-builder-open/server'
import { ScreenPackBuilderServer } from './screen-pack-builder/server'
import { ScreenPuzzleBuilderOpenServer } from './screen-puzzle-builder-open/server'
import { ScreenPuzzleBuilderServer } from './screen-puzzle-builder/server'
import { initServer, type ServerModule } from './types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    {},
    () => ScreenPuzzleBuilderServer.update(input),
    () => ScreenPuzzleBuilderOpenServer.update(input),
    () => ScreenPackBuilderOpenServer.update(input),
    () => ScreenPackBuilderServer.update(input)
  )
}

const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

export const BuilderServer = {
  init: initServer,
  update,
  subscriptions
}
