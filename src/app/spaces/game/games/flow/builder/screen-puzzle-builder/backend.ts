import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { BackendModule } from '../types'
import { DeleteForeverBackend } from './delete-forever/backend'
import { EditPuzzleNameBackend } from './edit-puzzle-name/backend'
import { SaveChangesBackend } from './save-changes/backend'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen(
    {},
    () => DeleteForeverBackend.update(input),
    () => EditPuzzleNameBackend.update(input),
    () => SaveChangesBackend.update(input),
  )
}

export const ScreenPuzzleBuilderBackend: Pick<BackendModule, 'update'> = {
  update,
}
