import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { ScreenPackBuilderOpenBackend } from './screen-pack-builder-open/backend'
import { ScreenPackBuilderBackend } from './screen-pack-builder/backend'
import { type BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen(
    {},
    () => ScreenPackBuilderOpenBackend.update(input),
    () => ScreenPackBuilderBackend.update(input),
  )
}

export const BuilderBackend = {
  update,
}
