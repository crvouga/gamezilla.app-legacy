import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import type { BackendModule } from '../types'
import { PackCreateNewBackend } from './create-new-pack/server'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => PackCreateNewBackend.update(input))
}

export const ScreenPackBuilderOpenBackend = {
  update,
}
