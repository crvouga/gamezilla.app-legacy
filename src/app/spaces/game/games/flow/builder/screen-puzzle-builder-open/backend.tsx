import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { BackendModule } from '../types'
import { CreateNewPuzzleBackend } from './create-new-puzzle/backend'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => CreateNewPuzzleBackend.update(input))
}

export const ScreenPuzzleBuilderOpenBackend = {
  update,
}
