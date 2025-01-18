import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { ScreenPackBuilderBackend } from './screen-pack-builder/backend'
import { type BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => ScreenPackBuilderBackend.update(input))
}

export const BuilderBackend = {
  update,
}
