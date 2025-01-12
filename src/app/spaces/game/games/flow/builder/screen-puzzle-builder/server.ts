import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import type { BackendModule } from '../types'
import { DeleteForeverBackend } from './delete-forever/server'
import { EditPuzzleNameBackend } from './edit-puzzle-name/server'
import { SaveChangesBackend } from './save-changes/server'

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
