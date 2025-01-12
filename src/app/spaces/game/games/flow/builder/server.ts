import { Sub } from '~/@/sub'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { ScreenPackBuilderOpenBackend } from './screen-pack-builder-open/server'
import { ScreenPackBuilderBackend } from './screen-pack-builder/server'
import { ScreenPuzzleBuilderOpenBackend } from './screen-puzzle-builder-open/server'
import { ScreenPuzzleBuilderBackend } from './screen-puzzle-builder/server'
import { initBackend, type BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen(
    {},
    () => ScreenPuzzleBuilderBackend.update(input),
    () => ScreenPuzzleBuilderOpenBackend.update(input),
    () => ScreenPackBuilderOpenBackend.update(input),
    () => ScreenPackBuilderBackend.update(input),
  )
}

const subscriptions: BackendModule['subscriptions'] = async () => {
  return Sub.None
}

export const BuilderBackend = {
  init: initBackend,
  update,
  subscriptions,
}
