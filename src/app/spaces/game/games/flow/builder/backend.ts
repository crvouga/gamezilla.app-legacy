import { Sub } from '~/@/sub'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { ScreenPackBuilderOpenBackend } from './screen-pack-builder-open/backend'
import { ScreenPackBuilderBackend } from './screen-pack-builder/backend'
import { ScreenPuzzleBuilderBackend } from './screen-puzzle-builder/backend'
import { initBackend, type BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen(
    {},
    () => ScreenPuzzleBuilderBackend.update(input),
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
